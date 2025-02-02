import { toast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/supabase/buckets";
import { convertToCSV } from "../../utils/csv";
import JSZip from "jszip";
import { fetchForecastData, FORECAST_ENDPOINTS } from "./forecast";

interface SyncProps {
  setSyncProgress: React.Dispatch<React.SetStateAction<number>>;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  connectionName: string;
  parentOrganizationId: string;
  apiKey: string;
}

export const handleSync = async ({
  setSyncProgress,
  setIsUploading,
  connectionName,
  parentOrganizationId,
  apiKey,
}: SyncProps) => {
  setSyncProgress(0);

  const progressInterval = setInterval(() => {
    setSyncProgress((current: number) => {
      if (current >= 99) {
        clearInterval(progressInterval);
        return current;
      }
      return current + 1;
    });
  }, 250);

  try {
    const bucketName = "forecast-exports";
    const filename = `${connectionName}.zip`;
    const filePath = `${parentOrganizationId}/${filename}`;

    const { forecastData } = await fetchForecastData(
      FORECAST_ENDPOINTS,
      apiKey
    );

    const zip = new JSZip();

    forecastData?.map((item) => {
      if (Array.isArray(item.data) || item?.data) {
        const content = Array.isArray(item.data) ? item.data : item.data;
        const csvContent = convertToCSV(content as Record<string, unknown>[]);

        zip.file(`${item.name}.csv`, csvContent);
      }
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const file = new File([zipBlob], filename, {
      type: "application/zip",
    });

    setIsUploading(true);
    await uploadFile(file, filePath, bucketName);
    setIsUploading(false);

    setSyncProgress(100);

    toast({
      title: "Success",
      description: "CSV file synced successfully",
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
    setSyncProgress(0);
  }
};
