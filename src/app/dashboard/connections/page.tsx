"use client";

import { Search } from "lucide-react";
import { CustomInput } from "@/components/custom";
import SettingsModal from "./settings-modal";
import { useEffect, useState } from "react";
import { ConnectionCardProps } from "./lib";
import ConnectionCard from "./connection-card";
import DockModal from "./dock-modal";
import { useAppContext } from "@/context";
import { ConnectionLoadingCard } from "@/components/connection-card-skeleton";
import { parseShopifyBulkData, ParsedShopifyData } from "@/lib/shopify";

interface BulkOperationStatus {
  operationId: string;
  status: string;
  objectCount?: number;
  url?: string;
}

export default function Connections() {
  const { selectedOrganization } = useAppContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] =
    useState<ConnectionCardProps | null>(null);
  const [bulkOperation, setBulkOperation] =
    useState<BulkOperationStatus | null>(null);
  const [shopifyData, setShopifyData] = useState<ParsedShopifyData>({
    orders: [],
    draftOrders: [],
    lineItems: [],
    customers: [],
    refunds: [],
  });
  const [error, setError] = useState<string | null>(null);

  const checkExistingOperation = async () => {
    try {
      const response = await fetch("/api/shopify");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check operation status");
      }

      if (data.operationId) {
        setBulkOperation({
          operationId: data.operationId,
          status: data.status,
          objectCount: data.objectCount,
          url: data.url,
        });

        // If the operation is already completed, fetch its data immediately
        if (data.status === "COMPLETED" && data.url) {
          const parsedData = await parseShopifyBulkData(data.url);
          setShopifyData(parsedData);
          return {
            hasExistingOperation: true,
            shopifyData: parsedData,
            bulkOperation: data,
          };
        }
      }
      return {
        hasExistingOperation: false,
        shopifyData: null,
        bulkOperation: null,
      };
    } catch (error) {
      console.error("Error checking existing operation:", error);
      return {
        hasExistingOperation: false,
        shopifyData: null,
        bulkOperation: null,
      };
    }
  };

  const startBulkOperation = async () => {
    try {
      setError(null);
      const response = await fetch("/api/shopify", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start bulk operation");
      }

      setBulkOperation({
        operationId: data.operationId,
        status: data.status,
      });
    } catch (error) {
      console.error("Error starting bulk operation:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to start bulk operation"
      );
    }
  };

  const checkBulkOperationStatus = async () => {
    if (!bulkOperation) return;

    try {
      const response = await fetch("/api/shopify");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check operation status");
      }

      setBulkOperation({
        operationId: data.operationId,
        status: data.status,
        objectCount: data.objectCount,
        url: data.url,
      });

      if (data.status === "COMPLETED" && data.url) {
        const parsedData = await parseShopifyBulkData(data.url);
        setShopifyData(parsedData);
      } else if (data.status === "FAILED") {
        throw new Error("Bulk operation failed");
      } else if (data.status === "CANCELED") {
        throw new Error("Bulk operation was canceled");
      } else {
        console.log("Bulk operation status:", data.status);
        if (data.objectCount) {
          console.log("Objects processed so far:", data.objectCount);
        }
      }
    } catch (error) {
      console.error("Error checking bulk operation:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to check operation status"
      );
    }
  };

  const cancelBulkOperation = async () => {
    try {
      const response = await fetch("/api/shopify", {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel operation");
      }

      setBulkOperation(null);
    } catch (error) {
      console.error("Error canceling bulk operation:", error);
      setError(
        error instanceof Error ? error.message : "Failed to cancel operation"
      );
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (bulkOperation && bulkOperation.status !== "COMPLETED") {
      // Check status every 5 seconds
      intervalId = setInterval(checkBulkOperationStatus, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [bulkOperation]);

  const handleShopifyDataFetch = async () => {
    // First check if there's an existing operation
    const { hasExistingOperation, shopifyData, bulkOperation } =
      await checkExistingOperation();

    // If there's a completed operation with data, return it
    if (
      hasExistingOperation &&
      bulkOperation?.status === "COMPLETED" &&
      shopifyData
    ) {
      return shopifyData;
    }

    // Only start a new operation if there isn't one in progress
    if (!hasExistingOperation) {
      await startBulkOperation();
    }

    // Poll for completion
    while (true) {
      await checkBulkOperationStatus();

      if (bulkOperation?.status === "COMPLETED" && shopifyData) {
        return shopifyData;
      } else if (
        bulkOperation?.status === "FAILED" ||
        bulkOperation?.status === "CANCELED"
      ) {
        throw new Error(`Bulk operation ${bulkOperation.status.toLowerCase()}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  };

  const handleShopifySync = async () => {
    try {
      await handleShopifyDataFetch();
    } catch (error) {
      console.error("Error syncing Shopify data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to sync Shopify data"
      );
    }
  };

  const handleEdit = (connection: ConnectionCardProps) => {
    setSelectedConnection(connection);
    setIsSettingsOpen(true);
  };

  const handleDock = (connection: ConnectionCardProps) => {
    setSelectedConnection(connection);
    setIsDockOpen(true);
  };

  return (
    <div className="mx-auto h-full max-w-[1400px] p-6 text-lg">
      <div className="flex flex-col h-full gap-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Connections</h1>
          <p className="text-base text-gray-300">
            Your integration connections
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {bulkOperation && (
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-4 py-2 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p>Bulk Operation Status: {bulkOperation.status}</p>
                {bulkOperation.objectCount && (
                  <p>Objects Processed: {bulkOperation.objectCount}</p>
                )}
              </div>
              {bulkOperation.status !== "COMPLETED" && (
                <button
                  onClick={cancelBulkOperation}
                  className="text-sm bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {shopifyData.orders.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded">
            <p>
              Successfully fetched {shopifyData.orders.length} orders,{" "}
              {shopifyData.lineItems.length} line items, and{" "}
              {shopifyData.customers.length} unique customers
            </p>
          </div>
        )}

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <CustomInput
            type="text"
            placeholder="Search"
            className="w-full pl-10 bg-gray-800 border-gray-700"
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!selectedOrganization?.id &&
            Array(4)
              .fill(0)
              .map((_, index) => <ConnectionLoadingCard key={index} />)}

          {selectedOrganization?.connections?.map((connection) => (
            <ConnectionCard
              key={connection.name}
              name={connection.name}
              type={connection.type}
              apiKey={connection.apiKey}
              connectionUrl={connection.connectionUrl}
              onEdit={() => handleEdit(connection)}
              onDock={() => handleDock(connection)}
              onSync={
                connection.type === "shopify" ? handleShopifySync : undefined
              }
            />
          ))}
        </div>

        {selectedOrganization?.connections?.length === 0 && (
          <div className="flex w-full h-full flex-col items-center justify-center gap-8">
            <div className="flex flex-col items-center justify-center w-full text-base">
              <p className="text-gray-400 text-center">
                You don&apos;t have any connection.
              </p>
              <p className="text-gray-400 text-center">
                Go to integrations to connect and start syncing your data.
              </p>
            </div>
          </div>
        )}

        <DockModal
          open={isDockOpen}
          onOpenChange={setIsDockOpen}
          connection={selectedConnection}
          shopifyDataFetch={
            selectedConnection?.type === "shopify"
              ? handleShopifyDataFetch
              : undefined
          }
        />

        <SettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          connection={selectedConnection}
        />
      </div>
    </div>
  );
}
