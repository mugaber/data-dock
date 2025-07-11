"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { cn, processZipFile } from "@/lib/utils";
import {
  ConnectionCardProps,
  fetchForecastData,
  FORECAST_ENDPOINTS,
} from "./lib";
import { Separator } from "@/components/ui/separator";
import { convertToCSV, convertToCSVExtended } from "../utils/csv";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/hooks/use-toast";
import { useAppContext } from "@/context";
import { downloadFile, uploadFile } from "@/lib/supabase/buckets";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { FORECAST_HEADERS } from "@/lib/types/forecast-headers";
import { fetchIntectData } from "./lib/intect";
import { ParsedShopifyData } from "@/lib/shopify";

interface DockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: ConnectionCardProps | null;
  shopifyDataFetch?: () => Promise<ParsedShopifyData>;
}

export default function DockModal({
  open,
  onOpenChange,
  connection,
  shopifyDataFetch,
}: DockModalProps) {
  const { parentOrganization } = useAppContext();

  const {
    isAuthenticated: isGoogleAuthenticated,
    accessToken: googleAccessToken,
    isLoading: isGoogleAuthLoading,
    initiateAuth: initiateGoogleAuth,
  } = useGoogleAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [showConnectionUrl, setShowConnectionUrl] = useState(true);
  const [copiedStates, setCopiedStates] = useState({
    server: false,
    username: false,
    password: false,
  });

  const [isExportingData, setIsExportingData] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleCopy = async (text: string, field: keyof typeof copiedStates) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [field]: false }));
    }, 500);
  };

  const handleGoogleSheetsExport = useCallback(async () => {
    if (!isGoogleAuthenticated || !googleAccessToken) {
      await initiateGoogleAuth();
      return;
    }

    setIsExportingData(true);
    setExportProgress(0);

    try {
      const bucketName = "forecast-exports";
      const filename = `${connection?.name}.zip`;
      const filePath = `${parentOrganization?.id}/${filename}`;

      const { data } = await downloadFile(filePath, bucketName);

      if (!data) {
        throw new Error("No data found, Please export data to CSV first");
      }

      const processedData = await processZipFile(data);

      const CHUNK_SIZE = 5000;

      const createResponse = await fetch("/api/google/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: googleAccessToken,
          connectionName: connection?.name,
          connectionType: connection?.type,
          sheetInfo: processedData.map((item) => ({ name: item.name })),
        }),
      });

      const { spreadsheetId, spreadsheetUrl } = await createResponse.json();

      for (const item of processedData) {
        if (!Array.isArray(item.data) || item.data.length === 0) {
          continue;
        }

        const headers =
          connection?.type === "forecast"
            ? FORECAST_HEADERS[item.name as keyof typeof FORECAST_HEADERS]
            : Object.keys(item.data[0] as Record<string, unknown>);

        const firstChuckData =
          item.data.length > CHUNK_SIZE
            ? item.data.slice(0, CHUNK_SIZE - 1)
            : item.data;

        const firstChunk = [
          headers,
          ...firstChuckData.map((row) =>
            headers.map((header) => {
              const value = row[header];
              // Handle null/undefined
              if (value === null || value === undefined) {
                return "";
              }
              // Handle numbers
              if (
                typeof value === "number" ||
                (!isNaN(Number(value)) && value !== "")
              ) {
                return Number(value);
              }
              // Handle booleans
              if (
                value === "true" ||
                value === "false" ||
                typeof value === "boolean"
              ) {
                return value === "true" || value === true;
              }
              // Handle dates - check if string matches ISO date format
              if (
                typeof value === "string" &&
                /^\d{4}-\d{2}-\d{2}/.test(value)
              ) {
                return value.split("T")[0]; // Remove time component if exists
              }
              // Remove leading apostrophe if exists
              if (typeof value === "string" && value.startsWith("'")) {
                return value.substring(1);
              }
              // Handle other types
              return value;
            })
          ),
        ];

        await fetch("/api/google/sheets/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: googleAccessToken,
            spreadsheetId,
            sheetName: item.name,
            data: firstChunk,
            startRow: 1,
          }),
        });

        for (let i = CHUNK_SIZE; i < item.data.length; i += CHUNK_SIZE) {
          const chunk = item.data.slice(i, i + CHUNK_SIZE).map((row) =>
            headers.map((header) => {
              const value = row[header];
              // Handle null/undefined
              if (value === null || value === undefined) {
                return "";
              }
              // Handle numbers
              if (
                typeof value === "number" ||
                (!isNaN(Number(value)) && value !== "")
              ) {
                return Number(value);
              }
              // Handle booleans
              if (
                value === "true" ||
                value === "false" ||
                typeof value === "boolean"
              ) {
                return value === "true" || value === true;
              }
              // Handle dates - check if string matches ISO date format
              if (
                typeof value === "string" &&
                /^\d{4}-\d{2}-\d{2}/.test(value)
              ) {
                return value.split("T")[0]; // Remove time component if exists
              }
              // Remove leading apostrophe if exists
              if (typeof value === "string" && value.startsWith("'")) {
                return value.substring(1);
              }
              // Handle other types
              return value;
            })
          );

          const updateResponse = await fetch("/api/google/sheets/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accessToken: googleAccessToken,
              spreadsheetId,
              sheetName: item.name,
              data: chunk,
              startRow: i + 1,
            }),
          });

          const { success } = await updateResponse.json();

          if (!success) {
            throw new Error("Failed to update Google Sheets");
          }

          setExportProgress(Math.round((i / item.data.length) * 100));
        }
      }

      toast({
        title: "Success",
        description: "Data exported to Google Sheets successfully",
      });

      if (spreadsheetUrl) {
        window.open(spreadsheetUrl, "_blank");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to export to Google Sheets",
        variant: "destructive",
      });
    } finally {
      setIsExportingData(false);
      setExportProgress(0);
    }
  }, [
    isGoogleAuthenticated,
    googleAccessToken,
    initiateGoogleAuth,
    connection,
    parentOrganization?.id,
  ]);

  const handleExportToCSV = async () => {
    setIsExportingData(true);
    setExportProgress(0);

    try {
      const bucketName = "forecast-exports";
      const filename = `${connection?.name}.zip`;
      const filePath = `${parentOrganization?.id}/${filename}`;

      const { data: existingData } = await downloadFile(filePath, bucketName);
      if (existingData) {
        const blob = new Blob([existingData], { type: "application/zip" });
        saveAs(blob, filename);
        return;
      }

      const zip = new JSZip();

      if (connection?.type === "shopify" && shopifyDataFetch) {
        setExportProgress(10);
        const shopifyData = await shopifyDataFetch();
        setExportProgress(50);

        if (shopifyData.orders.length > 0) {
          const ordersCSV = convertToCSV(
            shopifyData.orders as unknown as Record<string, unknown>[],
            "orders",
            "shopify"
          );
          zip.file("orders.csv", ordersCSV);
        }

        if (shopifyData.draftOrders.length > 0) {
          const draftOrdersCSV = convertToCSV(
            shopifyData.draftOrders as unknown as Record<string, unknown>[],
            "draft_orders",
            "shopify"
          );
          zip.file("draft_orders.csv", draftOrdersCSV);
        }

        if (shopifyData.lineItems.length > 0) {
          const lineItemsCSV = convertToCSV(
            shopifyData.lineItems as unknown as Record<string, unknown>[],
            "line_items",
            "shopify"
          );
          zip.file("line_items.csv", lineItemsCSV);
        }

        if (shopifyData.customers.length > 0) {
          const customersCSV = convertToCSV(
            shopifyData.customers as unknown as Record<string, unknown>[],
            "customers",
            "shopify"
          );
          zip.file("customers.csv", customersCSV);
        }

        if (shopifyData.refunds.length > 0) {
          const refundsCSV = convertToCSV(
            shopifyData.refunds as unknown as Record<string, unknown>[],
            "refunds",
            "shopify"
          );
          zip.file("refunds.csv", refundsCSV);
        }
      } else if (connection?.type === "intect") {
        const intectData = await fetchIntectData(connection);
        intectData?.map((item) => {
          const csvContent = convertToCSVExtended(
            item.data as Record<string, unknown>[],
            item.name || "",
            "intect"
          );
          zip.file(`${item.name}.csv`, csvContent);
        });
      } else if (connection?.type === "forecast") {
        const { forecastData } = await fetchForecastData(
          FORECAST_ENDPOINTS,
          connection?.apiKey || "",
          (progress) => setExportProgress(progress)
        );

        forecastData?.map((item) => {
          if (Array.isArray(item.data) || item?.data) {
            const content = Array.isArray(item.data) ? item.data : item.data;
            const csvContent = convertToCSV(
              content as Record<string, unknown>[],
              item.name || "",
              "forecast"
            );
            zip.file(`${item.name}.csv`, csvContent);
          }
        });
      }

      setExportProgress(95);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      setExportProgress(100);

      saveAs(zipBlob, filename);

      const file = new File([zipBlob], filename, {
        type: "application/zip",
      });

      await uploadFile(file, filePath, bucketName);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while exporting the data";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExportingData(false);
      setExportProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-6 bg-gray-800 text-white border-0">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-medium tracking-wide pr-3">
            Data Dock for {connection?.name}
          </DialogTitle>
        </DialogHeader>

        <Separator className="bg-gray-700" />

        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label
              htmlFor="server"
              className="text-base text-white font-normal"
            >
              Server URL
            </Label>
            <div className="relative">
              <Input
                id="server"
                className="bg-gray-800 text-gray-400 border-none py-5 pr-20 !text-base tracking-wide"
                value={connection?.connectionUrl}
                tabIndex={-1}
                type={showConnectionUrl ? "text" : "password"}
                readOnly
              />
              <div className="absolute right-0 top-1 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 hover:bg-transparent"
                  onClick={() => setShowConnectionUrl(!showConnectionUrl)}
                >
                  {showConnectionUrl ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    " px-2 hover:bg-transparent",
                    "transition-all duration-200"
                  )}
                  onClick={() =>
                    handleCopy(connection?.connectionUrl || "", "server")
                  }
                >
                  {copiedStates.server ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-base text-white font-normal"
            >
              User name
            </Label>
            <div className="relative">
              <Input
                id="username"
                type={showUsername ? "text" : "password"}
                className={cn(
                  "bg-gray-800 text-gray-400 border-0 py-5 pr-20 !text-base",
                  showUsername ? "tracking-wide" : "tracking-widest"
                )}
                value={connection?.dbUsername}
                readOnly
              />
              <div className="absolute right-0 top-1 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 hover:bg-transparent"
                  onClick={() => setShowUsername(!showUsername)}
                >
                  {showUsername ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 hover:bg-transparent"
                  onClick={() =>
                    handleCopy(connection?.dbUsername || "", "username")
                  }
                >
                  {copiedStates.username ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-base text-white font-normal"
            >
              Your password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className={cn(
                  "bg-gray-800 text-gray-400 border-0 py-5 pr-20 !text-base",
                  showPassword ? "tracking-wide" : "tracking-widest"
                )}
                value={connection?.dbPassword}
                readOnly
              />
              <div className="absolute right-0 top-1 h-full flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 hover:bg-transparent"
                  onClick={() =>
                    handleCopy(connection?.dbPassword || "", "password")
                  }
                >
                  {copiedStates.password ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-700 mb-1" />

        <DialogFooter>
          <div className="flex flex-col gap-4 w-full">
            <Button
              variant="default"
              disabled={isExportingData || isGoogleAuthLoading}
              className="w-full text-base py-5 bg-green-800 hover:bg-green-900"
              onClick={handleGoogleSheetsExport}
            >
              {isGoogleAuthLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Export to Google Sheets"
              )}
            </Button>
            <Button
              variant="default"
              className="w-full text-base py-5 bg-blue-700 hover:bg-blue-800"
              onClick={handleExportToCSV}
              disabled={isExportingData || isGoogleAuthLoading}
            >
              {isExportingData ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Export as CSV"
              )}
            </Button>

            {isExportingData && (
              <div className="mt-4">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1 text-center">
                  {exportProgress < 100
                    ? `Exporting data (${Math.round(exportProgress)}%)`
                    : "Finalizing export..."}
                </p>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
