import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Lambda } from "aws-sdk";

// Initialize AWS SDK clients
const lambda = new Lambda();

interface ConnectionDetails {
  id: string;
  type: string;
  name: string;
  apiKey: string;
  connectionUrl: string;
  syncInterval: string;
}

/**
 * This Lambda function is triggered in two scenarios:
 * 1. When a new connection is created (via API Gateway)
 * 2. On a schedule (via EventBridge Scheduler)
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Log the incoming event for debugging
    console.log("Received event:", JSON.stringify(event, null, 2));

    // For now, we'll only support direct API calls
    // Scheduled events with database queries will be implemented later
    const isScheduledEvent = event.queryStringParameters?.scheduled === "true";

    let connections: ConnectionDetails[] = [];

    if (isScheduledEvent) {
      // For scheduled events, we'll implement database queries later
      console.log("Scheduled events not yet implemented");
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({
          success: true,
          message: "Scheduled events not yet implemented",
        }),
      };
    } else {
      // For direct API calls, get the connection from the request body
      const connection = event.body ? JSON.parse(event.body) : null;

      if (!connection) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
          },
          body: JSON.stringify({ error: "Missing connection details" }),
        };
      }

      connections = [connection];
      console.log(`Received request to sync connection: ${connection.name}`);
    }

    // Process each connection
    const syncPromises = connections.map(async (connection) => {
      try {
        // Determine which Lambda function to invoke based on connection type
        let functionName;

        switch (connection.type) {
          case "forecast":
            functionName = process.env.FORECAST_SYNC_LAMBDA;
            break;
          case "intect":
            functionName = process.env.INTECT_SYNC_LAMBDA;
            break;
          default:
            console.warn(`Unsupported connection type: ${connection.type}`);
            return {
              connectionId: connection.id,
              status: "skipped",
              message: `Unsupported connection type: ${connection.type}`,
            };
        }

        if (!functionName) {
          console.warn(
            `No Lambda function configured for connection type: ${connection.type}`
          );
          return {
            connectionId: connection.id,
            status: "skipped",
            message: `No Lambda function configured for connection type: ${connection.type}`,
          };
        }

        console.log(
          `Invoking Lambda function: ${functionName} with connection: ${connection.name}`
        );

        // Invoke the appropriate Lambda function
        const params = {
          FunctionName: functionName,
          InvocationType: "Event", // Asynchronous invocation
          Payload: JSON.stringify(connection),
        };

        await lambda.invoke(params).promise();

        return {
          connectionId: connection.id,
          status: "initiated",
          message: `Sync initiated for ${connection.name}`,
        };
      } catch (error) {
        console.error(`Error syncing connection ${connection.name}:`, error);
        return {
          connectionId: connection.id,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(syncPromises);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({
        success: true,
        message: `Processed ${connections.length} connections`,
        results,
      }),
    };
  } catch (error) {
    console.error("Error in connection sync trigger:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to process connections",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
