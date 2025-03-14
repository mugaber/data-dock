import { FORECAST_HEADERS } from "@/lib/types/forecast-headers";

export const convertToCSV = (
  data: Record<string, unknown>[],
  tableName: string,
  type: "forecast" | "intect"
): string => {
  if (!data || data.length === 0) return "";

  const headers =
    type === "forecast"
      ? FORECAST_HEADERS[tableName as keyof typeof FORECAST_HEADERS]
      : Object.keys(data[0]);

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const cell = row[header]?.toString() ?? "";
          return cell.includes(",") || cell.includes("\n") || cell.includes('"')
            ? `"${cell.replace(/"/g, '""')}"`
            : cell;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
};

export const convertToCSVExtended = (
  data: Record<string, unknown>[],
  tableName: string,
  type: "forecast" | "intect"
): string => {
  if (!data || data.length === 0) return "";

  const expandedHeaders: string[] = [];
  const originalHeaders =
    type === "forecast"
      ? FORECAST_HEADERS[tableName as keyof typeof FORECAST_HEADERS]
      : Object.keys(data[0]);

  originalHeaders.forEach((header) => {
    const value = data[0][header];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.keys(value as object).forEach((key) => {
        expandedHeaders.push(`${header}_${key}`);
      });
    } else {
      expandedHeaders.push(header);
    }
  });

  const csvRows = [
    expandedHeaders.join(","),
    ...data.map((row) => {
      const rowValues: string[] = [];

      originalHeaders.forEach((header) => {
        const value = row[header];

        if (["SalaryStatements", "SalaryBatchRecords"].includes(header)) {
          rowValues.push("Dedicated table");
          return;
        }

        if (value && typeof value === "object" && !Array.isArray(value)) {
          Object.keys(value as object).forEach((key) => {
            const transformTables = [
              "salary_batch_records",
              "salary_statements",
            ].includes(tableName);
            const isNestedObject =
              (value as Record<string, unknown>)[key] &&
              typeof (value as Record<string, unknown>)[key] === "object" &&
              !Array.isArray((value as Record<string, unknown>)[key]);

            const cellValue =
              isNestedObject && transformTables
                ? JSON.stringify((value as Record<string, unknown>)[key])
                : (value as Record<string, unknown>)[key]?.toString() ?? "";

            const formattedCell =
              cellValue.includes(",") ||
              cellValue.includes("\n") ||
              cellValue.includes('"')
                ? `"${cellValue.replace(/"/g, '""')}"`
                : cellValue;
            rowValues.push(formattedCell);
          });
        } else {
          const cellValue = value?.toString() ?? "";
          const formattedCell =
            cellValue.includes(",") ||
            cellValue.includes("\n") ||
            cellValue.includes('"')
              ? `"${cellValue.replace(/"/g, '""')}"`
              : cellValue;
          rowValues.push(formattedCell);
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
