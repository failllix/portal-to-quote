import { initContract } from "@ts-rest/core";
import { z } from "zod";

const contract = initContract();

const FileUploadResult = z.object({
  id: z.string(),
});

const FileProcessingResult = z.object({
  id: z.string(),
  status: z.enum(["IN_PROCESS"]),
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
  success: z.boolean(),
  properties: GeometryProperties,
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
  uploadFile: {
    method: "POST",
    path: "/api/files/upload",
    contentType: "multipart/form-data",
    body: z.custom<File>(),
    responses: {
      400: ErrorResult,
      202: FileUploadResult,
    },
    summary: "Upload a CAD file for async processing",
    strictStatusCodes: true,
  },
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
