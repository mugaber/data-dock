import { supabase } from "./client";

export async function uploadFile(
  file: File,
  bucketName: string,
  filePath: string
) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      contentType: "application/zip",
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading file:", error);
  } else {
    return data;
  }
}

// TODO: Upload file to supabase bucket | local storage | S3

/**
 *   const handleExportToCSV = async () => {
    setIsExportingCSV(true);

    try {
      const cachedZip = localStorage.getItem(
        `${connection?.name}_forecast_data`
      );
      const cachedTimestamp = localStorage.getItem(
        `${connection?.name}_forecast_timestamp`
      );
      const TWELVE_HOURS = 60 * 60 * 1000 * 12;

      if (
        cachedZip &&
        cachedTimestamp &&
        Date.now() - Number(cachedTimestamp) < TWELVE_HOURS
      ) {
        const blob = new Blob([JSON.parse(cachedZip)], {
          type: "application/zip",
        });
        saveAs(blob, `${connection?.name}_${new Date().toISOString()}.zip`);
        return;
      }

      const { forecastData } = await fetchForecastData(
        FORECAST_ENDPOINTS,
        connection?.apiKey || ""
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
      const timestamp = new Date().toISOString();
      const filename = `${connection?.name}_${timestamp}.zip`;
      const filePath = `${parentOrganization?.id}/${filename}`;
      const file = new File([zipBlob], filename);

      uploadFile(file, "forecast-exports", filePath);

      const reader = new FileReader();
      reader.readAsDataURL(zipBlob);
      reader.onload = () => {
        localStorage.setItem(
          `${connection?.name}_forecast_data`,
          JSON.stringify(reader.result)
        );
        localStorage.setItem(
          `${connection?.name}_forecast_timestamp`,
          timestamp
        );
      };

      saveAs(zipBlob, filename);

      toast({
        title: "Success",
        description: "CSV file exported successfully",
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
    }
  };
 */
