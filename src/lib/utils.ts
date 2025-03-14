import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from "papaparse";
import JSZip from "jszip";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const processZipFile = async (zipData: Blob) => {
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipData);
  const csvData = [];

  for (const [filename, file] of Object.entries(contents.files)) {
    if (!file.dir && filename.endsWith(".csv")) {
      const content = await file.async("string");

      const parsedData = await new Promise((resolve) => {
        Papa.parse(content, {
          header: true,
          complete: (results) => resolve(results.data),
          skipEmptyLines: true,
        });
      });

      const sheetName = filename.replace(".csv", "");

      csvData.push({
        name: sheetName,
        data: parsedData,
      });
    }
  }

  return csvData;
};
