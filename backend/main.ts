import { createExpressEndpoints, initServer } from "@ts-rest/express";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { geometryContract } from "../shared/contract";
import { db } from "../db/db";
import { files } from "../db/schema";
import { eq } from "drizzle-orm";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();

const router = s.router(geometryContract, {
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
            status: "done",
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
    const fileId = params.id;
    console.log("Returning geometry data for file with id", fileId);

    try {
      const fileData = await db
        .select()
        .from(files)
        .where(eq(files.id, fileId));

      if (fileData.length === 0) {
        return {
          status: 404,
          body: {
            message: `No data for file with id '${fileId}' found.`,
          },
        };
      }

      if (fileData.length > 1) {
        return {
          status: 500,
          body: {
            message: `File id '${fileId}' is ambigous, found more than one result.`,
          },
        };
      }

      const file = fileData[0];

      if (file.status === "in_process") {
        return {
          status: 200,
          body: {
            status: "IN_PROCESS",
            processingTimeMs: 812,
          },
        };
      }

      if (file.status === "failed") {
        return {
          status: 200,
          body: {
            status: "FAILED",
            processingTimeMs: 12487,
          },
        };
      }

      return {
        status: 200,
        body: {
          status: "DONE",
          properties: file.geometry || undefined,
          processingTimeMs: 8047,
        },
      };
    } catch (error) {
      console.log(error);

      return {
        status: 500,
        body: {
          message: `Fetching data for file with id '${fileId}' failed.`,
        },
      };
    }
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
