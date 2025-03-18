import { Pool } from "pg";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

interface ConnectionDetails {
  id: string;
  type: string;
  name: string;
  apiKey: string;
  connectionUrl: string;
  syncInterval: string;
}

// Main Lambda handler
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract connection details from the event
    const connection: ConnectionDetails = event.body
      ? JSON.parse(event.body)
      : null;

    if (!connection) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing connection details" }),
      };
    }

    if (connection.type !== "intect") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "This Lambda function only handles Intect connections",
        }),
      };
    }

    console.log(`Starting sync for Intect connection: ${connection.name}`);

    // Authenticate with Intect API
    const credentials = Buffer.from(
      `${connection.name}:${connection.apiKey}`
    ).toString("base64");

    const response = await fetch("https://api.intect.app/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to authenticate with Intect API: ${response.statusText}`
      );
    }

    const authData = await response.json();
    console.log("Successfully authenticated with Intect API");

    // Fetch salary batches
    const salaryBatchesResponse = await fetch(
      "https://api.intect.app/api/salarybatches",
      {
        method: "GET",
        headers: {
          Authorization: `Token ${authData.Token}`,
        },
      }
    );

    if (!salaryBatchesResponse.ok) {
      throw new Error(
        `Failed to fetch salary batches: ${salaryBatchesResponse.statusText}`
      );
    }

    const salaryBatches = await salaryBatchesResponse.json();
    console.log(`Retrieved ${salaryBatches.length} salary batches`);

    // Insert data into database
    const connectionString = `${connection.connectionUrl}?sslmode=no-verify`;
    const ssl = { rejectUnauthorized: false };

    const pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 600000,
      connectionTimeoutMillis: 30000,
      ssl,
    });

    try {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Insert salary batches into the database
        for (const batch of salaryBatches) {
          await client.query(
            `
            INSERT INTO intect.salary_batches (
              id, name, description, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE
            SET name = $2, description = $3, updated_at = $5
            `,
            [
              batch.id,
              batch.name,
              batch.description || "",
              new Date(batch.created_at),
              new Date(batch.updated_at),
            ]
          );
        }

        await client.query("COMMIT");

        // Update the metadata table with the last sync time
        await client.query(`
          INSERT INTO intect.metadata (sync_status)
          VALUES ('success')
          ON CONFLICT (id) DO UPDATE
          SET last_sync_at = CURRENT_TIMESTAMP, sync_status = 'success', updated_at = CURRENT_TIMESTAMP
        `);

        // Log the sync event
        await client.query(`
          INSERT INTO intect.sync_logs (event_type, status, message)
          VALUES ('sync', 'success', 'Successfully synced salary batches')
        `);

        console.log("Successfully inserted data into database");
      } catch (error) {
        await client.query("ROLLBACK");

        // Log the sync error
        await client.query(
          `
          INSERT INTO intect.sync_logs (event_type, status, message)
          VALUES ('sync', 'error', $1)
        `,
          [error instanceof Error ? error.message : "Unknown error"]
        );

        throw error;
      } finally {
        client.release();
      }
    } finally {
      await pool.end();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Successfully synced Intect data for connection ${connection.name}`,
      }),
    };
  } catch (error) {
    console.error("Sync error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Failed to sync data",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
