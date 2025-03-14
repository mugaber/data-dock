import { toast } from "@/hooks/use-toast";
import { fetchForecastData, FORECAST_ENDPOINTS } from "./forecast";
import { ConnectionCardProps } from ".";

interface SyncProps {
  setSyncProgress: React.Dispatch<React.SetStateAction<number>>;
  connection: ConnectionCardProps;
}

export const handleSync = async ({
  setSyncProgress,
  connection,
}: SyncProps) => {
  if (connection.type === "intect") {
    await handleIntectSync(connection);
    return;
  }
  try {
    const interval = setInterval(() => {
      setSyncProgress((current) => {
        if (current >= 30) {
          clearInterval(interval);
        }
        return current + 1;
      });
    }, 1000);

    const { forecastData } = await fetchForecastData(
      FORECAST_ENDPOINTS,
      connection.apiKey || ""
    );

    const CHUNK_SIZE = 3000;
    let totalRecords = 0;
    let processedRecords = 0;

    forecastData.forEach((item) => {
      if (item.data) {
        totalRecords += Array.isArray(item.data) ? item.data.length : 1;
      }
    });

    for (const item of forecastData) {
      if (!item.data) continue;

      const records = Array.isArray(item.data) ? item.data : [item.data];
      const totalChunks = Math.ceil(records.length / CHUNK_SIZE);
      const MAX_CONCURRENT_REQUESTS = 10;

      console.log(
        `Processing table ${item.name} with ${records.length} records`
      );

      const chunks = Array.from({ length: totalChunks }, (_, i) => {
        const start = i * CHUNK_SIZE;
        return records.slice(start, start + CHUNK_SIZE);
      });

      for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_REQUESTS) {
        const chunkBatch = chunks.slice(i, i + MAX_CONCURRENT_REQUESTS);
        const chunkPromises = chunkBatch.map((chunk, batchIndex) => {
          const currentChunk = i + batchIndex + 1;

          return fetch("/dashboard/api/insert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              connectionUrl: connection?.connectionUrl,
              data: [
                {
                  name: item.name,
                  data: chunk,
                },
              ],
            }),
          }).then(async (response) => {
            const result = await response.json();
            if (!response.ok || !result.success) {
              console.error(
                `Error in chunk ${currentChunk}/${totalChunks} for ${item.name}:`,
                result
              );
              throw new Error(result.error || "Failed to sync data");
            }
            return chunk.length;
          });
        });

        const processedLengths = await Promise.all(chunkPromises);
        processedRecords += processedLengths.reduce((a, b) => a + b, 0);
        const progress =
          30 + Math.round((processedRecords / totalRecords) * 70);
        setSyncProgress(progress);
      }
    }

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

export const handleIntectSync = async (connection: ConnectionCardProps) => {
  const credentials = Buffer.from(
    `${connection.name}:${connection.apiKey}`
  ).toString("base64");

  const response = await fetch("https://api.intect.app/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
  });

  const authData = await response.json();

  console.log({
    authData,
  });

  const salaryBatchesResponse = await fetch(
    "https://api.intect.app/api/salarybatches",
    {
      method: "GET",
      headers: {
        Authorization: `Token ${authData.Token}`,
      },
    }
  );

  const salaryBatches = await salaryBatchesResponse.json();

  console.log({
    salaryBatches,
  });
};
