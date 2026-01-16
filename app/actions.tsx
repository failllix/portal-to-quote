"use server";

import { apiClient } from "@/shared/client";
import type { geometryContract } from "@/shared/contract";
import { createClient } from "@supabase/supabase-js";
import type { ClientInferResponseBody } from "@ts-rest/core";
import type { PriceDetails } from "./material-selection/logic";

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

type Materials = ClientInferResponseBody<
  typeof geometryContract.getMaterials,
  200
>;

export async function completeQuote({
  quoteId,
  material,
  priceDetails,
  quantity,
  volumeCm3,
}: {
  quoteId: string;
  material: Materials[number];
  priceDetails: PriceDetails;
  quantity: number;
  volumeCm3: number;
}) {
  const quoteCompletionResult = await apiClient.completeQuote({
    params: {
      id: quoteId,
    },
    body: {
      materialId: material.code,
      materialName: material.name,
      materialPriceFactor: material.price,
      quantity,
      quantityDiscount: priceDetails?.discountPercentage,
      totalPrice: priceDetails?.total,
      unitPrice: priceDetails?.unitPrice,
      volumeCm3,
    },
  });

  if (quoteCompletionResult.status !== 200) {
    throw Error(quoteCompletionResult.body.message);
  }
}
