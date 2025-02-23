import { supabase } from "./client";

export async function uploadFile(
  file: File,
  filePath: string,
  bucketName: string
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

export async function downloadFile(filePath: string, bucketName: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(`${filePath}?t=${Date.now()}`);

    if (error) {
      console.error("Error downloading file:", error);
      return { error: error.message };
    } else {
      return { data: data };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error downloading file:", error);
    return { error: errorMessage };
  }
}

export async function deleteFile(filePath: string, bucketName: string) {
  const { error } = await supabase.storage.from(bucketName).remove([filePath]);

  if (error) {
    console.error("Error deleting file:", error);
    return { error: error.message };
  } else {
    return { success: true };
  }
}
