import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const packagesTable = sqliteTable("packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull().default("apartments"),
  size: text("size").notNull().default(""),
  capacity: text("capacity").notNull().default(""),
  description: text("description").notNull(),
  features: text("features", { mode: "json" }).$type<string[]>().notNull().default([]),
  suitableFor: text("suitable_for").notNull().default(""),
  priceText: text("price_text").notNull().default(""),
  priceNote: text("price_note").notNull().default(""),
  rentalPeriod: text("rental_period").notNull().default(""),
  contactPhone1: text("contact_phone1").notNull().default(""),
  contactPhone2: text("contact_phone2").notNull().default(""),
  pricePerDay: real("price_per_day").notNull().default(0),
  imageUrl: text("image_url").notNull().default(""),
  images: text("images").notNull().default("[]"),
  order: integer("order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  seoEnabled: integer("seo_enabled", { mode: "boolean" }).notNull().default(false),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  seoKeywords: text("seo_keywords").notNull().default(""),
  seoSlug: text("seo_slug").notNull().default(""),
});

export const insertPackageSchema = createInsertSchema(packagesTable).omit({ id: true });
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packagesTable.$inferSelect;

// Backwards compatibility alias
export const containersTable = packagesTable;
export const insertContainerSchema = insertPackageSchema;
export type InsertContainer = InsertPackage;
export type Container = Package;
