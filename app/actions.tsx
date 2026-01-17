"use server";

import type { ClientInferRequest, ClientInferResponses } from "@ts-rest/core";
import { apiClient } from "@/shared/client";
import type { geometryContract } from "@/shared/contract";

type StartFileProcessingBody = ClientInferRequest<
  typeof geometryContract.startFileProcessing
>;
type StartFileProcessingResponse = ClientInferResponses<
  typeof geometryContract.startFileProcessing
>;

export async function startFileProcessing({
  body,
}: StartFileProcessingBody): Promise<StartFileProcessingResponse> {
  const fileProcessingResponse = await apiClient.startFileProcessing({
    body,
  });

  return fileProcessingResponse;
}

type CompleteQuoteBody = ClientInferRequest<
  typeof geometryContract.completeQuote
>;
type CompleteQuoteResponse = ClientInferResponses<
  typeof geometryContract.completeQuote
>;

export async function completeQuote({
  params,
  body,
}: CompleteQuoteBody): Promise<CompleteQuoteResponse> {
  const quoteCompletionResult = await apiClient.completeQuote({
    params,
    body,
  });

  return quoteCompletionResult;
}

type CreateOrderBody = ClientInferRequest<typeof geometryContract.createOrder>;
type CreateOrderResponse = ClientInferResponses<
  typeof geometryContract.createOrder
>;

export async function createOrder({
  body,
}: CreateOrderBody): Promise<CreateOrderResponse> {
  const orderCreationResult = await apiClient.createOrder({
    body,
  });

  return orderCreationResult;
}

type ProcessPaymentBody = ClientInferRequest<
  typeof geometryContract.processPayment
>;
type ProcessPaymentResponse = ClientInferResponses<
  typeof geometryContract.processPayment
>;

export async function processPayment({
  body,
  params,
}: ProcessPaymentBody): Promise<ProcessPaymentResponse> {
  const paymentProcessingResult = await apiClient.processPayment({
    body,
    params,
  });

  return paymentProcessingResult;
}
