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
import { convertToCSV } from "../utils/csv";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/hooks/use-toast";
import { useAppContext } from "@/context";
import { downloadFile, uploadFile } from "@/lib/supabase/buckets";
import { useGoogleAuth } from "@/hooks/use-google-auth";

interface DockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: ConnectionCardProps | null;
}

export default function DockModal({
  open,
  onOpenChange,
  connection,
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

      const response = await fetch("/api/google/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: googleAccessToken,
          connectionName: connection?.name,
          forecastData: processedData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setExportProgress(100);

      toast({
        title: "Success",
        description: "Data exported to Google Sheets successfully",
      });

      if (result.spreadsheetUrl) {
        window.open(result.spreadsheetUrl, "_blank");
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
  ]);

  const handleExportToCSV = async () => {
    setIsExportingData(true);
    setExportProgress(0);

    try {
      const bucketName = "forecast-exports";
      const filename = `${connection?.name}.zip`;
      const filePath = `${parentOrganization?.id}/${filename}`;

      const { data } = await downloadFile(filePath, bucketName);

      if (data) {
        const blob = new Blob([data], { type: "application/zip" });
        saveAs(blob, filename);
        return;
      }

      const { forecastData } = await fetchForecastData(
        FORECAST_ENDPOINTS,
        connection?.apiKey || "",
        (progress) => setExportProgress(progress)
      );

      const zip = new JSZip();

      forecastData?.map((item) => {
        if (Array.isArray(item.data) || item?.data) {
          const content = Array.isArray(item.data) ? item.data : item.data;
          const csvContent = convertToCSV(content as Record<string, unknown>[]);

          zip.file(`${item.name}.csv`, csvContent);
        }
      });

      setExportProgress(95);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      setExportProgress(100);

      saveAs(zipBlob, filename);

      const file = new File([zipBlob], filename, {
        type: "application/zip",
      });

      uploadFile(file, filePath, bucketName).catch((error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred while uploading the file";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      });
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
                value={connection?.username}
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
                    handleCopy(connection?.username || "", "username")
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
                value={connection?.password}
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
                    handleCopy(connection?.password || "", "password")
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
