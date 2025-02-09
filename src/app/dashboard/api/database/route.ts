import { createDatabase, deleteDatabase, testConnection } from "@/lib/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { connectionName, organizationId, userData } = await req.json();

    if (!connectionName || !organizationId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const connectionDatabase = await createDatabase({
      connectionName,
      organizationId,
      userData,
    });

    const isConnected = await testConnection(connectionDatabase.connectionUrl);

    if (!isConnected) {
      throw new Error("Failed to connect to the newly created database");
    }

    return NextResponse.json(connectionDatabase);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? // @ts-expect-error This is a Prisma error
          error?.meta?.message || error.message
        : "Unknown error occurred";

    console.error("Detailed error in database creation:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });

    return NextResponse.json(
      { error: "Failed to create database", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { dbName, username, deleteOrgUser } = await req.json();
    await deleteDatabase(dbName, username, deleteOrgUser);
    return NextResponse.json({ message: "Database deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete database" },
      { status: 500 }
    );
  }
}
