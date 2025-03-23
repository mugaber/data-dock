import { NextResponse } from "next/server";
import { GraphQLClient } from "graphql-request";
import {
  BULK_OPERATION_QUERY,
  CHECK_BULK_OPERATION_QUERY,
  CANCEL_BULK_OPERATION_QUERY,
  BulkOperationResponse,
  CurrentBulkOperationResponse,
  CancelBulkOperationResponse,
} from "@/app/dashboard/connections/lib/shopify";

const SHOPIFY_ACCESS_TOKEN = "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";
const SHOPIFY_GRAPHQL_URL =
  "https://frama-b2c.myshopify.com/admin/api/2025-01/graphql.json";

// In-memory storage for operation status (in production, use a database)
let currentOperation: {
  id: string;
  status: string;
  url?: string;
} | null = null;

export async function POST() {
  try {
    const client = new GraphQLClient(SHOPIFY_GRAPHQL_URL, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    // Start the bulk operation
    const response = await client.request<BulkOperationResponse>(
      BULK_OPERATION_QUERY
    );

    if (response.bulkOperationRunQuery.userErrors.length > 0) {
      return NextResponse.json(
        { error: response.bulkOperationRunQuery.userErrors[0].message },
        { status: 400 }
      );
    }

    const operation = response.bulkOperationRunQuery.bulkOperation;
    currentOperation = operation;

    return NextResponse.json({
      operationId: operation.id,
      status: operation.status,
      message: "Bulk operation started successfully",
    });
  } catch (error) {
    console.error("Error starting bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to start bulk operation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = new GraphQLClient(SHOPIFY_GRAPHQL_URL, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const response = await client.request<CurrentBulkOperationResponse>(
      CHECK_BULK_OPERATION_QUERY
    );
    const operation = response.currentBulkOperation;

    if (!operation) {
      currentOperation = null;
      return NextResponse.json({
        operationId: null,
        status: null,
        message: "No bulk operation in progress",
      });
    }

    // Check if the operation is older than 12 hours
    const operationCreatedAt = new Date(operation.createdAt);
    const now = new Date();
    const hoursSinceCreation =
      (now.getTime() - operationCreatedAt.getTime()) / (1000 * 60 * 60);

    // If operation is completed but older than 12 hours, we should create a new one
    if (operation.status === "COMPLETED" && hoursSinceCreation > 12) {
      currentOperation = null;
      return NextResponse.json({
        operationId: null,
        status: null,
        message: "Existing operation is too old, will create new one",
      });
    }

    // Update current operation status
    currentOperation = operation;

    return NextResponse.json({
      operationId: operation.id,
      status: operation.status,
      objectCount: operation.objectCount,
      url: operation.url,
      createdAt: operation.createdAt,
      hoursSinceCreation: Math.round(hoursSinceCreation),
    });
  } catch (error) {
    console.error("Error checking bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to check bulk operation status" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    if (!currentOperation) {
      return NextResponse.json(
        { error: "No bulk operation in progress" },
        { status: 404 }
      );
    }

    const client = new GraphQLClient(SHOPIFY_GRAPHQL_URL, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const response = await client.request<CancelBulkOperationResponse>(
      CANCEL_BULK_OPERATION_QUERY
    );

    if (response.bulkOperationCancel.userErrors.length > 0) {
      return NextResponse.json(
        { error: response.bulkOperationCancel.userErrors[0].message },
        { status: 400 }
      );
    }

    currentOperation = null;

    return NextResponse.json({
      message: "Bulk operation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to cancel bulk operation" },
      { status: 500 }
    );
  }
}
