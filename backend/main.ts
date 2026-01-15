import { createExpressEndpoints, initServer } from "@ts-rest/express";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import multer from "multer";
import { geometryContract } from "../shared/contract.ts";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });

const s = initServer();

const router = s.router(geometryContract, {
  uploadFile: {
    middleware: [upload.single("file")],
    handler: async ({ req }) => {
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
  geometryResult: async ({ params }) => {
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
});

createExpressEndpoints(geometryContract, router, app);

const port = process.env.port || 3333;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
