import { initContract } from "@ts-rest/core";
import { z } from "zod";

const contract = initContract();

const paymentMethodEnum = z.enum(["card", "purchase_order"]);
const paymentStatusEnum = z.enum(["pending", "paid", "failed"]);

const FileProcessingBody = z.object({
  id: z.string(),
  originalName: z.string(),
  storagePath: z.string(),
  sizeBytes: z.number(),
  mimeType: z.string(),
});

const FileProcessingResult = z.object({
  id: z.string(),
  status: z.literal("in_process"),
});

const GeometryProperties = z.object({
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  volume: z.number(),
  volumeCm3: z.number(),
  surfaceArea: z.number(),
});

const GeometryResult = z.discriminatedUnion("status", [
  z.object({
    status: z.enum(["in_process", "failed"]),
    processingTimeMs: z.number(),
  }),
  z.object({
    status: z.literal("done"),
    properties: GeometryProperties,
    processingTimeMs: z.number(),
  }),
]);

const MaterialsResult = z.array(
  z.object({
    name: z.string(),
    code: z.string(),
    price: z.number(),
    leadTimeDays: z.number(),
    properties: z.array(z.string()),
  }),
);

const QuoteCreationBody = z.object({
  fileId: z.string(),
});

const QuoteCompletionBody = z.object({
  materialId: z.string(),
  quantity: z.number().min(1),
});

const QuoteCreationResult = z.object({
  id: z.string(),
});

const QuoteResult = z.discriminatedUnion("status", [
  z.object({
    status: z.enum(["draft"]),
    id: z.string(),
    fileId: z.string(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
  }),
  z.object({
    status: z.enum(["ready", "ordered"]),
    id: z.string(),
    fileId: z.string(),
    materialId: z.string(),
    materialName: z.string(),
    materialPriceFactor: z.number(),
    quantity: z.number(),
    volumeCm3: z.number(),
    unitPrice: z.number(),
    quantityDiscount: z.number(),
    totalPrice: z.number(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
  }),
  z.object({
    status: z.enum(["expired"]),
    id: z.string(),
    fileId: z.string(),
    materialId: z.string().optional(),
    materialName: z.string().optional(),
    materialPriceFactor: z.number().optional(),
    quantity: z.number().optional(),
    volumeCm3: z.number().optional(),
    unitPrice: z.number().optional(),
    quantityDiscount: z.number().optional(),
    totalPrice: z.number().optional(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
  }),
]);

const OrderCreationBody = z.object({
  quoteId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerCompany: z.string().optional(),
  paymentMethod: paymentMethodEnum,
});

const OrderCreationResult = z.object({
  id: z.string(),
});

const OrderResult = z.object({
  id: z.string(),
  quoteId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerCompany: z.string().optional(),
  paymentMethod: paymentMethodEnum,
  paymentStatus: paymentStatusEnum,
  expectedDeliveryAt: z.string().datetime(),
  totalAmount: z.number(),
  currency: z.string(),
  createdAt: z.string().datetime(),
});

const PaymentProcessingBody = z.object({
  paymentStatus: z.enum(["paid", "failed"]),
});

const PaymentProcessingResult = z.object({
  id: z.string(),
});

const ErrorResult = z.object({
  message: z.string(),
});

export const geometryContract = contract.router({
  startFileProcessing: {
    method: "POST",
    path: "/api/files/startProcessing",
    body: FileProcessingBody,
    responses: {
      202: FileProcessingResult,
      500: ErrorResult,
    },
    summary: "Upload a CAD file for async processing",
    strictStatusCodes: true,
  },
  getGeometryResult: {
    method: "GET",
    path: "/api/files/:id",
    responses: {
      200: GeometryResult,
      404: ErrorResult,
      500: ErrorResult,
    },
    summary: "Result of the geometry extraction service",
    strictStatusCodes: true,
  },
  getMaterials: {
    method: "GET",
    path: "/api/materials",
    responses: {
      200: MaterialsResult,
    },
    summary: "Available materials",
    strictStatusCodes: true,
  },
  createQuote: {
    method: "POST",
    path: "/api/quotes",
    body: QuoteCreationBody,
    responses: {
      200: QuoteCreationResult,
      404: ErrorResult,
      500: ErrorResult,
    },
    summary: "Create quote",
    strictStatusCodes: true,
  },
  getQuote: {
    method: "GET",
    path: "/api/quotes/:id",
    responses: {
      200: QuoteResult,
      404: ErrorResult,
      500: ErrorResult,
    },
    summary: "Get quote details",
    strictStatusCodes: true,
  },
  completeQuote: {
    method: "POST",
    path: "/api/quotes/:id/complete",
    body: QuoteCompletionBody,
    responses: {
      200: QuoteCreationResult,
      400: ErrorResult,
      404: ErrorResult,
      500: ErrorResult,
    },
    summary: "Add missing data to quote and set to ready status",
    strictStatusCodes: true,
  },
  createOrder: {
    method: "POST",
    path: "/api/orders",
    body: OrderCreationBody,
    responses: {
      200: OrderCreationResult,
      400: ErrorResult,
      500: ErrorResult,
    },
    summary: "Create order",
    strictStatusCodes: true,
  },
  getOrder: {
    method: "GET",
    path: "/api/orders/:id",
    responses: {
      200: OrderResult,
      404: ErrorResult,
      500: ErrorResult,
    },
    summary: "Get order details",
    strictStatusCodes: true,
  },
  processPayment: {
    method: "POST",
    path: "/api/orders/:id/payment",
    body: PaymentProcessingBody,
    responses: {
      200: PaymentProcessingResult,
      400: ErrorResult,
      404: ErrorResult,
      500: ErrorResult,
    },
    summary: "Add payment method to order",
    strictStatusCodes: true,
  },
});
