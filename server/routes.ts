import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { awsService } from "./aws";
import { insertVideoSchema, insertAwsConfigSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/aws-config", async (_req, res) => {
    try {
      const config = await storage.getAwsConfig();
      if (!config) {
        return res.status(404).json({ message: "AWS configuration not found" });
      }
      
      const sanitized = {
        ...config,
        accessKeyId: config.accessKeyId ? '****' + config.accessKeyId.slice(-4) : '',
        secretAccessKey: '****'
      };
      
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/aws-config", async (req, res) => {
    try {
      const validated = insertAwsConfigSchema.parse(req.body);
      const config = await storage.upsertAwsConfig(validated);
      
      awsService.initialize(config);
      
      const sanitized = {
        ...config,
        accessKeyId: config.accessKeyId ? '****' + config.accessKeyId.slice(-4) : '',
        secretAccessKey: '****'
      };
      
      res.json(sanitized);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/videos", async (_req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/videos", async (req, res) => {
    try {
      const validated = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(validated);
      res.json(video);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.updateVideo(req.params.id, req.body);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/videos/:id", async (req, res) => {
    try {
      await storage.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/upload/presigned-url", async (req, res) => {
    try {
      if (!awsService.isInitialized()) {
        return res.status(400).json({ message: "AWS service not configured. Please configure AWS settings first." });
      }

      const { filename, contentType } = req.body;
      if (!filename) {
        return res.status(400).json({ message: "Filename is required" });
      }

      const timestamp = Date.now();
      const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `uploads/${timestamp}-${sanitized}`;
      
      const uploadUrl = await awsService.getPresignedUploadUrl(key, contentType || 'video/mp4');
      
      res.json({ uploadUrl, key });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/videos/:id/transcode", async (req, res) => {
    try {
      if (!awsService.isInitialized()) {
        return res.status(400).json({ message: "AWS service not configured" });
      }

      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const outputPath = `transcoded/${req.params.id}/`;
      const jobId = await awsService.startTranscodeJob(video.s3Key, outputPath);
      
      await storage.updateVideo(req.params.id, {
        transcodeStatus: 'processing',
        hlsUrl: awsService.getVideoUrl(`${outputPath}master.m3u8`)
      });

      res.json({ jobId, status: 'processing' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
