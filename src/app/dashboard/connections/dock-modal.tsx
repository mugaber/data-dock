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
import { useState } from "react";
import { cn } from "@/lib/utils";
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

  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    server: false,
    username: false,
    password: false,
  });

  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleCopy = async (text: string, field: keyof typeof copiedStates) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [field]: false }));
    }, 500);
  };

  const handleExportToCSV = async () => {
    setIsExportingCSV(true);
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

      uploadFile(file, filePath, bucketName).then(() => {
        toast({
          title: "Success",
          description: "CSV file uploaded to the server successfully",
        });
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExportingCSV(false);
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
                className="bg-gray-800 text-gray-400 border-none py-5 pr-10 !text-base tracking-wide"
                value="name@example.com"
                tabIndex={-1}
                readOnly
              />
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "absolute right-0 top-0 h-full px-2 hover:bg-transparent",
                  "transition-all duration-200"
                )}
                onClick={() => handleCopy("name@example.com", "server")}
              >
                {copiedStates.server ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </Button>
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
                value="username123"
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
                  onClick={() => handleCopy("username123", "username")}
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
                value="password123"
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
                  onClick={() => handleCopy("password123", "password")}
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
              disabled={isExportingCSV}
              className="w-full text-base py-5 bg-green-800 hover:bg-green-900"
            >
              Connect to Google Sheets
            </Button>
            <Button
              variant="default"
              className="w-full text-base py-5 bg-blue-700 hover:bg-blue-800"
              onClick={handleExportToCSV}
              disabled={isExportingCSV}
            >
              {isExportingCSV ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Export as CSV"
              )}
            </Button>

            {isExportingCSV && (
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
