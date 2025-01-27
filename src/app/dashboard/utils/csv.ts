export const convertToCSV = (data: Record<string, unknown>[]): string => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
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
