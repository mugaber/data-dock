import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { connection } = await request.json();

    if (!connection) {
      return NextResponse.json(
        { error: "Missing connection details" },
        { status: 400 }
      );
    }

    console.log("Calling Lambda function with connection:", connection);

    // Call the AWS Lambda function to trigger the sync process
    const lambdaEndpoint =
      process.env.SYNC_LAMBDA_ENDPOINT ||
      "https://koszpoqi8e.execute-api.eu-central-1.amazonaws.com/dev/sync";

    // Send the connection object directly, matching the curl command format
    const response = await fetch(lambdaEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Don't wrap the connection object, send it directly as is
      body: JSON.stringify({
        id: connection.id,
        type: connection.type,
        name: connection.name,
        apiKey: connection.apiKey,
        connectionUrl: connection.connectionUrl,
        syncInterval: connection.syncInterval,
      }),
    });

    if (!response.ok) {
      console.error("Failed to trigger sync process");
      console.error("Response status:", response.status);
      console.error("Response status text:", response.statusText);

      let errorMessage = "Failed to trigger sync process";

      try {
        const errorData = await response.json();
        console.error("Error data:", errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error("Could not parse error response:", e);
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Sync process result:", result);

    return NextResponse.json({
      success: true,
      message: "Sync process initiated",
      details: result,
    });
  } catch (error) {
    console.error("Sync trigger error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to trigger sync process",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
