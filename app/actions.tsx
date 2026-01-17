"use server";

import type { ClientInferRequest, ClientInferResponses } from "@ts-rest/core";
import { apiClient } from "@/shared/client";
import type { portalToQuoteContract } from "@/shared/contract";

type StartFileProcessingBody = ClientInferRequest<
  typeof portalToQuoteContract.startFileProcessing
>;
type StartFileProcessingResponse = ClientInferResponses<
  typeof portalToQuoteContract.startFileProcessing
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
  typeof portalToQuoteContract.completeQuote
>;
type CompleteQuoteResponse = ClientInferResponses<
  typeof portalToQuoteContract.completeQuote
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

type CreateOrderBody = ClientInferRequest<
  typeof portalToQuoteContract.createOrder
>;
type CreateOrderResponse = ClientInferResponses<
  typeof portalToQuoteContract.createOrder
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
  typeof portalToQuoteContract.processPayment
>;
type ProcessPaymentResponse = ClientInferResponses<
  typeof portalToQuoteContract.processPayment
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
