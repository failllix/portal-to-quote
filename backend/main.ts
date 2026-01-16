import { createExpressEndpoints, initServer } from "@ts-rest/express";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Request } from "express";
import multer from "multer";
import { geometryContract } from "../shared/contract";
import { db } from "../db/db";
import { files } from "../db/schema";
import { eq } from "drizzle-orm";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });

const s = initServer();

const router = s.router(geometryContract, {
  uploadFile: {
    middleware: [upload.single("file")],
    handler: async ({ req }: { req: Request }) => {
      const file = req.file;

      if (
        !file?.originalname.endsWith(".step") ||
        file?.originalname.endsWith(".stp")
      ) {
        return {
          status: 400,
          body: {
            message: "File must be of type .step or .stp",
          },
        };
      }

      if (file.size > 50_000_000) {
        return {
          status: 400,
          body: {
            message: "File must be smaller than 50MB",
          },
        };
      }

      return {
        status: 202,
        body: { id: crypto.randomUUID() },
      };
    },
  },
  startFileProcessing: async ({
    body: { id, mimeType, originalName, sizeBytes, storagePath },
  }) => {
    try {
      await db.insert(files).values({
        mimeType,
        id,
        originalName,
        sizeBytes,
        storagePath,
      });

      setTimeout(async () => {
        await db
          .update(files)
          .set({
            geometry: {
              boundingBox: { x: 250, y: 250, z: 45 },
              volume: 2812500,
              volumeCm3: 2812.5,
              surfaceArea: 486000,
            },
          })
          .where(eq(files.id, id));
      }, 10_000);
    } catch (error) {
      console.error(error);

      return {
        status: 500,
        body: {
          message: "Geometry data extraction failed",
        },
      };
    }

    return {
      status: 202,
      body: {
        id,
        status: "IN_PROCESS",
      },
    };
  },
  getGeometryResult: async ({ params }) => {
    console.log("Returning geometry data for file with id", params.id);

    return {
      status: 200,
      body: {
        success: true,
        properties: {
          boundingBox: { x: 250, y: 250, z: 45 },
          volume: 2812500,
          volumeCm3: 2812.5,
          surfaceArea: 486000,
        },
        processingTimeMs: 8047,
      },
    };
  },
  getMaterials: async () => {
    return {
      status: 200,
      body: [
        {
          name: "PLA",
          code: "pla",
          price: 0.08,
          leadTimeDays: 3,
          properties: ["Standard prototyping", "Biodegradable"],
        },
        {
          name: "ABS",
          code: "abs",
          price: 0.12,
          leadTimeDays: 3,
          properties: ["Heat resistant", "Good mechanical strength"],
        },
        {
          name: "Nylon PA12",
          code: "pa12",
          price: 0.28,
          leadTimeDays: 3,
          properties: ["Industrial grade", "High wear resistance"],
        },
        {
          name: "Polypropylene",
          code: "pp",
          price: 0.18,
          leadTimeDays: 7,
          properties: ["Chemical resistant", "Living hinges"],
        },
        {
          name: "TPU 95A",
          code: "tpu",
          price: 0.22,
          leadTimeDays: 5,
          properties: ["Flexible", "Impact resistant"],
        },
      ],
    };
  },
});

createExpressEndpoints(geometryContract, router, app);

const port = process.env.port || 3333;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
