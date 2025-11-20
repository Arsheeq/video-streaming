import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Videos Table - stores video metadata
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  s3Key: text("s3_key").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  heroImageUrl: text("hero_image_url"),
  videoUrl: text("video_url"),
  hlsUrl: text("hls_url"),
  duration: text("duration").default("0h 00m"),
  year: integer("year").default(sql`EXTRACT(YEAR FROM CURRENT_DATE)`),
  genre: text("genre").array().default(sql`ARRAY[]::text[]`),
  rating: text("rating").default("NR"),
  transcodeStatus: text("transcode_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AWS Configuration Table - stores AWS credentials (single row)
export const awsConfig = pgTable("aws_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accessKeyId: text("access_key_id").notNull(),
  secretAccessKey: text("secret_access_key").notNull(),
  bucketName: text("bucket_name").notNull(),
  region: text("region").notNull().default("us-east-1"),
  cloudfrontDomain: text("cloudfront_domain"),
  mediaConvertEndpoint: text("mediaconvert_endpoint"),
  mediaConvertRole: text("mediaconvert_role"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod Schemas for Validation
export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAwsConfigSchema = createInsertSchema(awsConfig).omit({
  id: true,
  updatedAt: true,
});

// Types
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type AwsConfig = typeof awsConfig.$inferSelect;
export type InsertAwsConfig = z.infer<typeof insertAwsConfigSchema>;
