import { initContract } from "@ts-rest/core";
import { z } from "zod";

const contract = initContract();

const FileUploadResult = z.object({
  id: z.string(),
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

const GeometrySuccessResult = z.object({
  success: z.boolean(),
  properties: GeometryProperties.optional(),
  processingTimeMs: z.number(),
  error: z.string().optional(),
});

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
  },
  geometryResult: {
    method: "GET",
    path: "/api/files/:id",
    responses: {
      200: GeometrySuccessResult,
      404: ErrorResult,
    },
    summary: "Result of the geometry extraction service",
  },
});
