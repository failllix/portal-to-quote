import { createExpressEndpoints, initServer } from "@ts-rest/express";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { geometryContract } from "../shared/contract";
import { db } from "../db/db";
import { files, materials, orders, quotes } from "../db/schema";
import { eq } from "drizzle-orm";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();

async function finishGeometryExtraction(fileId: string) {
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
    .where(eq(files.id, fileId));
}

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

      // We cannot emulate async processing in production, because Vercel kills the function once the response was send. Thus, the setTimeout callback is never executed and the file processing will never finish.
      if (process.env.NODE_ENV === "production") {
        await finishGeometryExtraction(id);
      } else {
        setTimeout(async () => {
          await finishGeometryExtraction(id);
        }, 6_000);
      }
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
        status: "in_process",
      },
    };
  },
  getGeometryResult: async ({ params: { id: fileId } }) => {
    console.log("Returning geometry data for file with id", fileId);

    try {
      const file = await db.query.files.findFirst({
        where: eq(files.id, fileId),
      });

      if (!file) {
        return {
          status: 404,
          body: {
            message: `No data for file with id '${fileId}' found.`,
          },
        };
      }

      switch (file.status) {
        case "in_process":
        case "failed":
          return {
            status: 200,
            body: {
              status: file.status,
              processingTimeMs: 812,
            },
          };
        case "done":
          if (file.geometry === null) {
            throw new Error("Geometry data is missing unexpectedly for file");
          }

          return {
            status: 200,
            body: {
              status: file.status,
              properties: file.geometry,
              processingTimeMs: 8047,
            },
          };
      }
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
    const materialsResult = await db.select().from(materials);

    return {
      status: 200,
      body: materialsResult.map((material) => ({
        ...material,
        price: Number(material.price),
      })),
    };
  },
  createQuote: async ({ body: { fileId } }) => {
    try {
      const file = await db.query.files.findFirst({
        where: eq(files.id, fileId),
      });

      if (!file) {
        return {
          status: 404,
          body: {
            message: `Cannot create quote, because file with id '${fileId}' was not found.`,
          },
        };
      }

      const quotesResult = await db
        .insert(quotes)
        .values({
          fileId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })
        .returning({ id: quotes.id });

      return {
        status: 200,
        body: { id: quotesResult[0].id },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        body: {
          message: `Creating quote for file id '${fileId}' failed.`,
        },
      };
    }
  },
  getQuote: async ({ params: { id: quoteId } }) => {
    try {
      const quote = await db.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
      });

      if (!quote) {
        return {
          status: 404,
          body: {
            message: `No data for quote with id '${quoteId}' found.`,
          },
        };
      }

      if (quote.status === "draft") {
        return {
          status: 200,
          body: {
            status: quote.status,
            id: quote.id,
            fileId: quote.fileId,
            createdAt: quote.createdAt.toISOString(),
            expiresAt: quote.expiresAt.toISOString(),
          },
        };
      }

      if (quote.status === "expired") {
        return {
          status: 200,
          body: {
            status: quote.status,
            id: quote.id,
            fileId: quote.fileId,
            createdAt: quote.createdAt.toISOString(),
            expiresAt: quote.expiresAt.toISOString(),
            materialId: quote.materialId ?? undefined,
            materialName: quote.materialName ?? undefined,
            materialPriceFactor: quote.materialPriceFactor
              ? Number(quote.materialPriceFactor)
              : undefined,
            quantity: quote.quantity ?? undefined,
            volumeCm3: quote.volumeCm3 ? Number(quote.volumeCm3) : undefined,
            unitPrice: quote.unitPrice ? Number(quote.unitPrice) : undefined,
            quantityDiscount: quote.quantityDiscount
              ? Number(quote.quantityDiscount)
              : undefined,
            totalPrice: quote.totalPrice ? Number(quote.totalPrice) : undefined,
          },
        };
      }

      if (
        quote.materialId === null ||
        quote.materialName === null ||
        quote.quantity === null ||
        quote.volumeCm3 === null ||
        quote.quantityDiscount === null ||
        quote.totalPrice === null
      ) {
        throw new Error("Properties are unexpectedly missing.");
      }

      return {
        status: 200,
        body: {
          status: quote.status,
          id: quote.id,
          fileId: quote.fileId,
          createdAt: quote.createdAt.toISOString(),
          expiresAt: quote.expiresAt.toISOString(),
          materialId: quote.materialId,
          materialName: quote.materialName,
          materialPriceFactor: Number(quote.materialPriceFactor),
          quantity: quote.quantity,
          volumeCm3: Number(quote.volumeCm3),
          unitPrice: Number(quote.unitPrice),
          quantityDiscount: Number(quote.quantityDiscount),
          totalPrice: Number(quote.totalPrice),
        },
      };
    } catch (error) {
      console.log(error);

      return {
        status: 500,
        body: {
          message: `Fetching data for quote with id '${quoteId}' failed.`,
        },
      };
    }
  },
  completeQuote: async ({
    params: { id: quoteId },
    body: {
      materialId,
      materialName,
      materialPriceFactor,
      quantity,
      quantityDiscount,
      totalPrice,
      unitPrice,
      volumeCm3,
    },
  }) => {
    try {
      const quote = await db.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
      });

      if (!quote) {
        return {
          status: 404,
          body: {
            message: `Cannot complete quote, because quote with id '${quoteId}' was not found.`,
          },
        };
      }

      if (quote.status !== "draft") {
        return {
          status: 400,
          body: {
            message: `Cannot complete quote, because quote with id '${quoteId}' is no longer in 'draft' state. Quote is already in '${quote.status}' state.`,
          },
        };
      }

      await db
        .update(quotes)
        .set({
          materialId,
          materialName,
          materialPriceFactor: materialPriceFactor.toString(),
          quantity,
          quantityDiscount: quantityDiscount.toString(),
          totalPrice: totalPrice.toString(),
          unitPrice: unitPrice.toString(),
          volumeCm3: volumeCm3.toString(),
          status: "ready",
        })
        .where(eq(quotes.id, quoteId));

      return {
        status: 200,
        body: { id: quoteId },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        body: {
          message: `Completing quote with id '${quoteId}' failed.`,
        },
      };
    }
  },
  createOrder: async ({
    body: {
      customerCompany,
      customerEmail,
      customerName,
      paymentMethod,
      quoteId,
      totalAmount,
    },
  }) => {
    try {
      const quote = await db.query.quotes.findFirst({
        where: eq(quotes.id, quoteId),
      });

      if (!quote) {
        return {
          status: 404,
          body: {
            message: `Cannot create order, because quote with id '${quoteId}' was not found.`,
          },
        };
      }

      if (quote.status !== "ready") {
        return {
          status: 400,
          body: {
            message: `Cannot create order, because quote with id '${quoteId}' is not in 'ready' state. Quote is currently in '${quote.status}' state.`,
          },
        };
      }

      const orderId = await db.transaction(async () => {
        const ordersResult = await db
          .insert(orders)
          .values({
            quoteId,
            customerName,
            customerEmail,
            customerCompany,
            paymentMethod,
            totalAmount: totalAmount.toString(),
          })
          .returning({ id: orders.id });

        await db
          .update(quotes)
          .set({
            status: "ordered",
          })
          .where(eq(quotes.id, quoteId));

        return ordersResult[0].id;
      });

      return {
        status: 200,
        body: { id: orderId },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        body: {
          message: `Creating order for quote '${quoteId}' failed.`,
        },
      };
    }
  },
  getOrder: async ({ params: { id: orderId } }) => {
    try {
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!order) {
        return {
          status: 404,
          body: {
            message: `Order with id '${orderId}' was not found.`,
          },
        };
      }

      return {
        status: 200,
        body: {
          id: order.id,
          createdAt: order.createdAt.toISOString(),
          currency: order.currency,
          customerCompany: order.customerCompany ?? undefined,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          quoteId: order.quoteId,
          totalAmount: Number(order.totalAmount),
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        body: {
          message: `Getting details for order with id '${orderId}' failed.`,
        },
      };
    }
  },
  processPayment: async () => {
    return {
      status: 200,
      body: { id: "fooo" },
    };
  },
});

createExpressEndpoints(geometryContract, router, app);

const port = process.env.port || 3333;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
