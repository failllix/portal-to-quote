"use server";

import { apiClient } from "@/shared/client";
import { createClient } from "@supabase/supabase-js";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file found");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const fileId = crypto.randomUUID();
  const storagePath = `stepFiles/${fileId}`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(storagePath, file, {
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const fileProcessingResponse = await apiClient.startFileProcessing({
    body: {
      storagePath,
      id: fileId,
      mimeType: "text/plain",
      originalName: file.name,
      sizeBytes: file.size,
    },
  });

  if (fileProcessingResponse.status !== 202) {
    throw Error(fileProcessingResponse.body.message);
  }

  return { id: fileId };
}
