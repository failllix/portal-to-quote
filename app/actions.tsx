"use server";

import { apiClient } from "@/shared/client";
import type { geometryContract } from "@/shared/contract";
import type {
  ClientInferRequest,
  ClientInferResponseBody,
} from "@ts-rest/core";
import type { PriceDetails } from "./material-selection/logic";

export async function uploadFile({
  storagePath,
  fileId,
  fileName,
  fileSize,
}: {
  storagePath: string;
  fileId: string;
  fileName: string;
  fileSize: number;
}) {
  const fileProcessingResponse = await apiClient.startFileProcessing({
    body: {
      storagePath,
      id: fileId,
      mimeType: "text/plain",
      originalName: fileName,
      sizeBytes: fileSize,
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

type CreateOrderBody = ClientInferRequest<typeof geometryContract.createOrder>;

export async function createOrder({
  body: {
    customerCompany,
    customerEmail,
    customerName,
    paymentMethod,
    quoteId,
    totalAmount,
  },
}: CreateOrderBody) {
  const orderCreationResult = await apiClient.createOrder({
    body: {
      customerCompany,
      customerEmail,
      customerName,
      paymentMethod,
      quoteId,
      totalAmount,
    },
  });

  if (orderCreationResult.status !== 200) {
    throw Error(orderCreationResult.body.message);
  }

  return orderCreationResult.body;
}
