// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc } from "drizzle-orm";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var videos = pgTable("videos", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var awsConfig = pgTable("aws_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accessKeyId: text("access_key_id").notNull(),
  secretAccessKey: text("secret_access_key").notNull(),
  bucketName: text("bucket_name").notNull(),
  region: text("region").notNull().default("us-east-1"),
  cloudfrontDomain: text("cloudfront_domain"),
  mediaConvertEndpoint: text("mediaconvert_endpoint"),
  mediaConvertRole: text("mediaconvert_role"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAwsConfigSchema = createInsertSchema(awsConfig).omit({
  id: true,
  updatedAt: true
});

// server/storage.ts
var { Pool } = pg;
var DatabaseStorage = class {
  db;
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }
  // User methods
  async getUser(id) {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async createUser(insertUser) {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  // Video methods
  async getAllVideos() {
    return this.db.select().from(videos).orderBy(desc(videos.createdAt));
  }
  async getVideo(id) {
    const result = await this.db.select().from(videos).where(eq(videos.id, id));
    return result[0];
  }
  async createVideo(video) {
    const result = await this.db.insert(videos).values(video).returning();
    return result[0];
  }
  async updateVideo(id, video) {
    const result = await this.db.update(videos).set({ ...video, updatedAt: /* @__PURE__ */ new Date() }).where(eq(videos.id, id)).returning();
    return result[0];
  }
  async deleteVideo(id) {
    await this.db.delete(videos).where(eq(videos.id, id));
  }
  // AWS Config methods
  async getAwsConfig() {
    const result = await this.db.select().from(awsConfig).limit(1);
    return result[0];
  }
  async upsertAwsConfig(config) {
    const existing = await this.getAwsConfig();
    if (existing) {
      const result = await this.db.update(awsConfig).set({ ...config, updatedAt: /* @__PURE__ */ new Date() }).where(eq(awsConfig.id, existing.id)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(awsConfig).values(config).returning();
      return result[0];
    }
  }
};
var storage = new DatabaseStorage();

// server/aws.ts
import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var AwsService = class {
  s3Client = null;
  config = null;
  constructor() {
    this.initializeFromEnv();
  }
  initializeFromEnv() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
    if (accessKeyId && secretAccessKey && region && bucketName && cloudfrontDomain) {
      this.config = {
        accessKeyId,
        secretAccessKey,
        region,
        bucketName,
        cloudfrontDomain
      };
      this.s3Client = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey
        }
      });
      console.log("[AWS] Initialized from environment variables");
    } else {
      console.log("[AWS] Missing environment variables - AWS features disabled until secrets are configured");
    }
  }
  isInitialized() {
    return this.s3Client !== null && this.config !== null;
  }
  getConfig() {
    return this.config;
  }
  async listBucketFiles(prefix = "") {
    if (!this.s3Client || !this.config) {
      throw new Error("AWS service not initialized. Please configure AWS credentials in Secrets.");
    }
    const command = new ListObjectsV2Command({
      Bucket: this.config.bucketName,
      Prefix: prefix
    });
    const response = await this.s3Client.send(command);
    return response.Contents || [];
  }
  async getPresignedUploadUrl(key, contentType = "video/mp4") {
    if (!this.s3Client || !this.config) {
      throw new Error("AWS service not initialized. Please configure AWS credentials in Secrets.");
    }
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      ContentType: contentType
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
  getCloudFrontUrl(videoId, filename) {
    if (!this.config) {
      throw new Error("AWS service not initialized");
    }
    const baseFilename = filename.replace(/\.[^/.]+$/, "");
    return `https://${this.config.cloudfrontDomain}/assets/${baseFilename}/HLS/${baseFilename}.m3u8`;
  }
  getBucketName() {
    if (!this.config) {
      throw new Error("AWS service not initialized");
    }
    return this.config.bucketName;
  }
};
var awsService = new AwsService();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/aws-status", async (_req, res) => {
    try {
      const isConfigured = awsService.isInitialized();
      const config = awsService.getConfig();
      if (isConfigured && config) {
        res.json({
          configured: true,
          region: config.region,
          bucketName: config.bucketName,
          cloudfrontDomain: config.cloudfrontDomain,
          accessKeyId: "****" + config.accessKeyId.slice(-4)
        });
      } else {
        res.json({
          configured: false,
          message: "AWS credentials not configured. Please add AWS secrets to enable video uploads."
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/videos", async (_req, res) => {
    try {
      const videos2 = await storage.getAllVideos();
      res.json(videos2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/videos", async (req, res) => {
    try {
      const validated = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(validated);
      res.json(video);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.patch("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.updateVideo(req.params.id, req.body);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/videos/:id", async (req, res) => {
    try {
      await storage.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/upload/presigned-url", async (req, res) => {
    try {
      if (!awsService.isInitialized()) {
        console.error("[Upload] AWS service not configured");
        return res.status(400).json({
          message: "AWS service not configured. Please add AWS secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME, AWS_CLOUDFRONT_DOMAIN) to enable uploads."
        });
      }
      const { filename, contentType, videoId } = req.body;
      if (!filename || !videoId) {
        console.error("[Upload] Missing required fields:", { filename: !!filename, videoId: !!videoId });
        return res.status(400).json({ message: "Filename and videoId are required" });
      }
      const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
      const key = `inputs/${videoId}/${sanitized}`;
      console.log("[Upload] Generating presigned URL for:", key);
      const uploadUrl = await awsService.getPresignedUploadUrl(key, contentType || "video/mp4");
      const hlsUrl = awsService.getCloudFrontUrl(videoId, sanitized);
      console.log("[Upload] Presigned URL generated successfully");
      res.json({
        uploadUrl,
        s3Key: key,
        hlsUrl
      });
    } catch (error) {
      console.error("[Upload] Error generating presigned URL:", error);
      res.status(500).json({
        message: error.message || "Failed to generate upload URL",
        details: error.toString()
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  css: {
    postcss: {
      plugins: []
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(process.cwd(), "dist/public");
  app2.use(express.static(distPath));
  app2.get("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
