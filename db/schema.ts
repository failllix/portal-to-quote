import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  jsonb,
  timestamp,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "ready",
  "ordered",
  "expired",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "purchase_order",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
]);

export const fileProcessingStatusEnum = pgEnum("file_status", [
  "in_process",
  "done",
  "failed",
]);

interface GeometryProperties {
  boundingBox: {
    x: number;
    y: number;
    z: number;
  };
  volume: number;
  volumeCm3: number;
  surfaceArea: number;
}

export const materials = pgTable("materials", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  leadTimeDays: integer("lead_time_days").notNull(),
  properties: jsonb("properties").$type<string[]>().notNull(),
});

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalName: text("original_name").notNull(),
  storagePath: text("storage_path").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  geometry: jsonb("geometry").$type<GeometryProperties | null>(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  status: fileProcessingStatusEnum("status").notNull().default("in_process"),
});

export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileId: uuid("file_id")
    .notNull()
    .references(() => files.id),
  materialId: text("material_id").notNull(),
  materialName: text("material_name").notNull(),
  materialPriceFactor: decimal("material_price_factor", {
    precision: 10,
    scale: 4,
  }).notNull(),
  quantity: integer("quantity").notNull(),
  volumeCm3: decimal("volume_cm3", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantityDiscount: decimal("quantity_discount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: quoteStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  quoteId: uuid("quote_id")
    .notNull()
    .references(() => quotes.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerCompany: text("customer_company"),

  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ many }) => ({
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  file: one(files, {
    fields: [quotes.fileId],
    references: [files.id],
  }),
  order: one(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  quote: one(quotes, {
    fields: [orders.quoteId],
    references: [quotes.id],
  }),
}));

export type DbMaterialSelect = typeof materials.$inferSelect;
export type DbSelectFile = typeof files.$inferSelect;
export type DbInsertFile = typeof files.$inferInsert;
export type DbSelectQuote = typeof quotes.$inferSelect;
export type DbInsertQuote = typeof quotes.$inferInsert;
export type DbSelectOrder = typeof orders.$inferSelect;
export type DbInsertOrder = typeof orders.$inferInsert;
