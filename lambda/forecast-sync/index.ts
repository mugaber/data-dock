import { Pool } from "pg";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

interface ForecastEndpoint {
  path: string;
  version: string;
  name?: string;
  description: string;
}

interface ForecastData {
  id: string;
  totalObjectCount: number;
  pageSize: number;
  pageContents: unknown[];
  path: string;
}

interface ConnectionDetails {
  id: string;
  type: string;
  name: string;
  apiKey: string;
  connectionUrl: string;
  syncInterval: string;
}

// Forecast endpoints to fetch data from
const FORECAST_ENDPOINTS: ForecastEndpoint[] = [
  {
    path: "/projects",
    version: "v1",
    name: "projects",
    description: "Get all projects",
  },
  {
    path: "/time_registrations/date_after/19900101",
    version: "v4",
    name: "time_registrations",
    description: "Get time registrations after date",
  },
  {
    path: "/persons",
    version: "v2",
    name: "persons",
    description: "Get all persons",
  },
  {
    path: "/person_cost_periods",
    version: "v1",
    name: "person_cost_periods",
    description: "Get person cost periods",
  },
  {
    path: "/expense_items",
    version: "v1",
    name: "expense_items",
    description: "Get expense items",
  },
  {
    path: "/expense_categories",
    version: "v1",
    name: "expense_categories",
    description: "Get expense categories",
  },
  {
    path: "/rate_cards",
    version: "v1",
    name: "rate_cards",
    description: "Get rate cards",
  },
];

// Helper function to get endpoint name from URL
const getEndpointName = (url: string) => {
  return FORECAST_ENDPOINTS.find((endpoint) => {
    const responseUrl = new URL(url);
    const cleanPath = responseUrl.pathname.replace(/^\/api\/v\d+/, "");
    return cleanPath === endpoint.path;
  })?.name;
};

// Handle multiple pages of data
const handleMultiplePages = async (
  data: ForecastData,
  path: string,
  apiKey: string
) => {
  if (Array.isArray(data)) {
    return data;
  }

  const totalObjects = data?.totalObjectCount;
  const pageSize = data?.pageSize;
  const totalPages = Math.ceil(totalObjects / pageSize);

  const promises = [];
  const pageContents = [];

  for (let i = 0; i < totalPages; i++) {
    promises.push(
      fetch(`${path}?pageNumber=${i + 1}`, {
        headers: {
          "X-FORECAST-API-KEY": apiKey,
        },
      })
    );
  }

  const responses = await Promise.all(promises);
  for (const response of responses) {
    const data = await response.json();
    pageContents.push(data.pageContents);
  }

  return pageContents.flat();
};

// Fetch data from Forecast API
const fetchForecastData = async (
  endpoints: ForecastEndpoint[],
  apiKey: string
) => {
  const promises = [];
  const forecastData = [];

  try {
    for (const endpoint of endpoints) {
      promises.push(
        fetch(
          `https://api.forecast.it/api/${endpoint.version}${endpoint.path}`,
          {
            headers: {
              "X-FORECAST-API-KEY": apiKey,
            },
          }
        )
      );
    }

    const responses = await Promise.all(promises);
    for (const response of responses) {
      if (response.status > 400) {
        throw new Error("Invalid API key");
      }

      const data = await response.json();
      const pageContents = await handleMultiplePages(
        data,
        response.url,
        apiKey
      );

      forecastData.push({
        name: getEndpointName(response.url),
        data: pageContents,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(errorMessage);
  }

  return { forecastData };
};

// Insert data into database
const insertDataToDatabase = async (
  connectionUrl: string,
  tableName: string,
  data: ForecastData[]
) => {
  // TODO: use CA_CERT and sslmode=verify-full in production
  const connectionString = `${connectionUrl}?sslmode=no-verify`;
  const ssl = { rejectUnauthorized: false };

  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 600000,
    connectionTimeoutMillis: 30000,
    ssl,
  });

  try {
    if (!data || data.length === 0) {
      console.log(`No data to insert for table ${tableName}`);
      return { success: true, message: "No records to process" };
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const tableColumnsResult = await client.query(
        `
          SELECT column_name, data_type, udt_name
          FROM information_schema.columns 
          WHERE table_schema = 'forecast' 
          AND table_name = $1
        `,
        [tableName]
      );

      const validColumns = tableColumnsResult.rows.map((col) =>
        col.column_name.toLowerCase()
      );

      const columnTypes = tableColumnsResult.rows.reduce(
        (acc, col) => ({
          ...acc,
          [col.column_name.toLowerCase()]: {
            data_type: col.data_type,
            udt_name: col.udt_name,
          },
        }),
        {} as Record<string, { data_type: string; udt_name: string }>
      );

      const CHUNK_SIZE = 3000;
      const chunks = [];

      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        chunks.push(data.slice(i, i + CHUNK_SIZE));
      }

      for (const chunk of chunks) {
        const valuePlaceholders = chunk
          .map(
            (_: unknown, batchIndex: number) =>
              `(${validColumns
                .map(
                  (_, colIndex) =>
                    `$${batchIndex * validColumns.length + colIndex + 1}`
                )
                .join(",")})`
          )
          .join(",");

        const values = chunk.flatMap((record: ForecastData) =>
          validColumns.map((col) => {
            // @ts-expect-error ForecastData is not typed
            const value = record[col];
            const colType = columnTypes[col.toLowerCase()];

            if (!colType || value === null || value === undefined) {
              return null;
            }

            switch (colType.data_type) {
              case "date":
                return value ? (value as string).split("T")[0] : null;
              case "timestamp with time zone":
                return value || null;
              case "boolean":
                return value === true || value === "true" || value === 1;
              case "integer":
                return value === "" ? null : Number(value);
              case "double precision":
                return value === "" ? null : Number(value);
              case "ARRAY":
                if (Array.isArray(value)) {
                  return value;
                }
                return null;
              case "jsonb":
                return value ? JSON.stringify(value) : null;
              default:
                return value;
            }
          })
        );

        const insertQuery = `
          INSERT INTO forecast.${tableName} (${validColumns.join(",")})
          VALUES ${valuePlaceholders}
          ON CONFLICT (id) DO UPDATE
          SET ${validColumns
            .filter((col) => col.toLowerCase() !== "id")
            .map((col) => `${col} = EXCLUDED.${col}`)
            .join(", ")}
        `;

        await client.query(insertQuery, values);
      }

      await client.query("COMMIT");

      // Update the metadata table with the last sync time
      await client.query(`
        INSERT INTO forecast.metadata (sync_status)
        VALUES ('success')
        ON CONFLICT (id) DO UPDATE
        SET last_sync_at = CURRENT_TIMESTAMP, sync_status = 'success', updated_at = CURRENT_TIMESTAMP
      `);

      // Log the sync event
      await client.query(`
        INSERT INTO forecast.sync_logs (event_type, status, message)
        VALUES ('sync', 'success', 'Successfully synced ${tableName} with ${data.length} records')
      `);

      return {
        success: true,
        message: `Successfully processed ${data.length} records for ${tableName}`,
      };
    } catch (error) {
      await client.query("ROLLBACK");

      // Log the sync error
      await client.query(
        `
        INSERT INTO forecast.sync_logs (event_type, status, message)
        VALUES ('sync', 'error', $1)
      `,
        [error instanceof Error ? error.message : "Unknown error"]
      );

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Insert error for table ${tableName}:`, error);
    return {
      success: false,
      error: "Failed to insert data",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await pool.end();
  }
};

// Main Lambda handler
export const handler = async (
  event: APIGatewayProxyEvent | ConnectionDetails
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Handle both direct object events and API Gateway events
    let connection: ConnectionDetails;
    if ("body" in event) {
      // API Gateway event
      if (!event.body) {
        console.error("No event body provided");
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing event body" }),
        };
      }
      connection = JSON.parse(event.body);
    } else {
      // Direct object event
      connection = event;
    }

    console.log(
      "Parsed connection details:",
      JSON.stringify(connection, null, 2)
    );

    if (!connection.apiKey || !connection.connectionUrl) {
      console.error("Missing required connection details");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required connection details" }),
      };
    }

    console.log("Fetching Forecast data...");
    const { forecastData } = await fetchForecastData(
      FORECAST_ENDPOINTS,
      connection.apiKey
    );
    console.log(`Fetched ${forecastData.length} endpoints`);

    for (const { name, data } of forecastData) {
      if (!name) {
        console.warn("Skipping data without endpoint name");
        continue;
      }

      console.log(`Inserting ${data.length} records for endpoint ${name}`);
      try {
        await insertDataToDatabase(connection.connectionUrl, name, data);
        console.log(`Successfully inserted data for endpoint ${name}`);
      } catch (error) {
        console.error(`Error inserting data for endpoint ${name}:`, error);
        throw error;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Data sync completed successfully",
      }),
    };
  } catch (error) {
    console.error("Error in Forecast sync:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
    };
  }
};
