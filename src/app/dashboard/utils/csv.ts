import { FORECAST_HEADERS } from "@/lib/types/forecast-headers";

export const convertToCSV = (
  data: Record<string, unknown>[],
  tableName: string,
  type: "forecast" | "intect" | "shopify"
): string => {
  if (!data || data.length === 0) return "";

  const headers =
    type === "forecast"
      ? FORECAST_HEADERS[tableName as keyof typeof FORECAST_HEADERS]
      : Object.keys(data[0]);

  // Helper function to format cell value
  const formatCell = (value: unknown): string => {
    // Handle null or undefined
    if (value === null || value === undefined) {
      return '""';
    }

    // Handle objects and arrays
    if (typeof value === "object") {
      const jsonStr = JSON.stringify(value).replace(/"/g, '""');
      return `"${jsonStr}"`;
    }

    // Always quote the cell to prevent any issues with special characters
    const cell = String(value).replace(/"/g, '""');
    return `"${cell}"`;
  };

  const csvRows = [
    // Quote all headers to be consistent
    headers.map((header) => `"${header}"`).join(","),
    ...data.map((row) =>
      headers.map((header) => formatCell(row[header])).join(",")
    ),
  ];

  return csvRows.join("\n");
};

export const convertToCSVExtended = (
  data: Record<string, unknown>[],
  tableName: string,
  type: "forecast" | "intect" | "shopify"
): string => {
  if (!data || data.length === 0) return "";

  const directHeaders: string[] = [];
  const objectHeaderMappings: Record<string, string[]> = {};
  const originalHeaders =
    type === "forecast"
      ? FORECAST_HEADERS[tableName as keyof typeof FORECAST_HEADERS]
      : Object.keys(data[0]);

  originalHeaders.forEach((header) => {
    const value = data[0][header];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const objectKeys = Object.keys(value as object);
      objectHeaderMappings[header] = objectKeys.map(
        (key) => `${header}_${key}`
      );
    } else {
      directHeaders.push(header);
    }
  });

  const expandedHeaders: string[] = [...directHeaders];
  Object.values(objectHeaderMappings).forEach((mappings) => {
    expandedHeaders.push(...mappings);
  });

  const csvRows = [
    expandedHeaders.join(","),
    ...data.map((row) => {
      const rowValues: string[] = [];

      directHeaders.forEach((header) => {
        const value = row[header];

        if (
          ["SalaryStatements", "SalaryBatchRecords"].includes(header) &&
          tableName === "salary_batches"
        ) {
          rowValues.push("Dedicated table");
          return;
        }

        const cellValue = value?.toString() ?? "";
        const formattedCell =
          cellValue.includes(",") ||
          cellValue.includes("\n") ||
          cellValue.includes('"')
            ? `"${cellValue.replace(/"/g, '""')}"`
            : cellValue;
        rowValues.push(formattedCell);
      });

      Object.entries(objectHeaderMappings).forEach(([header, mappings]) => {
        const value = row[header];

        if (value && typeof value === "object" && !Array.isArray(value)) {
          const objectKeys = Object.keys(value as object);

          mappings.forEach((mapping) => {
            const key = mapping.substring(header.length + 1);

            if (objectKeys.includes(key)) {
              const transformTables = [
                "salary_batch_records",
                "salary_statements",
              ].includes(tableName);

              const propertyValue = (value as Record<string, unknown>)[key];
              const isNestedObject =
                propertyValue &&
                typeof propertyValue === "object" &&
                !Array.isArray(propertyValue);

              const cellValue =
                isNestedObject && transformTables
                  ? JSON.stringify(propertyValue)
                  : propertyValue?.toString() ?? "";

              const formattedCell =
                cellValue.includes(",") ||
                cellValue.includes("\n") ||
                cellValue.includes('"')
                  ? `"${cellValue.replace(/"/g, '""')}"`
                  : cellValue;

              rowValues.push(formattedCell);
            } else {
              rowValues.push("");
            }
          });
        } else {
          mappings.forEach(() => rowValues.push(""));
        }
      });

      return rowValues.join(",");
    }),
  ];

  return csvRows.join("\n");
};

export const downloadCSV = (csvContent: string, fileName: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
