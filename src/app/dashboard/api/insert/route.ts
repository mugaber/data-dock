import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { connectionUrl, data } = await request.json();

    if (!connectionUrl || !data) {
      return NextResponse.json(
        { error: "Missing connectionUrl or data" },
        { status: 400 }
      );
    }

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
      const item = data[0];
      if (!item?.data || !item?.name) {
        throw new Error("Invalid data format");
      }

      const tableName = item.name.toLowerCase().replace(/-/g, "_");
      const records = Array.isArray(item.data) ? item.data : [item.data];

      if (records.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No records to process",
        });
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

        const recordColumns = Object.keys(records[0]);

        const validColumns = recordColumns.filter((col) =>
          tableColumnsResult.rows.some(
            (dbCol) => dbCol.column_name.toLowerCase() === col.toLowerCase()
          )
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

        const valuePlaceholders = records
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

        const values = records.flatMap((record: Record<string, unknown>) =>
          validColumns.map((col) => {
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
        await client.query("COMMIT");

        return NextResponse.json({
          success: true,
          message: `Successfully processed ${records.length} records for ${tableName}`,
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error("Insert error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to insert data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
