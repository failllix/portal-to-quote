import { initContract } from "@ts-rest/core";
import { z } from "zod";

const contract = initContract();

const fileProcessingEnum = z.enum(["IN_PROCESS", "DONE", "FAILED"]);

const FileProcessingResult = z.object({
  id: z.string(),
  status: fileProcessingEnum,
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

const GeometryResult = z.object({
  status: fileProcessingEnum,
  properties: GeometryProperties.optional(),
  processingTimeMs: z.number(),
});

const MaterialsResult = z.array(
  z.object({
    name: z.string(),
    code: z.string(),
    price: z.number(),
    leadTimeDays: z.number(),
    properties: z.array(z.string()),
  })
);

const ErrorResult = z.object({
  message: z.string(),
});

export const geometryContract = contract.router({
  startFileProcessing: {
    method: "POST",
    path: "/api/files/startProcessing",
    body: z.object({
      id: z.string(),
      originalName: z.string(),
      storagePath: z.string(),
      sizeBytes: z.number(),
      mimeType: z.string(),
    }),
    responses: {
      500: ErrorResult,
      202: FileProcessingResult,
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
});
