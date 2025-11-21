import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { awsService } from "./aws";
import { insertVideoSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/aws-status", async (_req, res) => {
    try {
      const isConfigured = awsService.isInitialized();
      const config = awsService.getConfig();
      
      if (isConfigured && config) {
        res.json({
          configured: true,
          region: config.region,
          bucketName: config.bucketName,
          cloudfrontDomain: config.cloudfrontDomain,
          accessKeyId: '****' + config.accessKeyId.slice(-4)
        });
      } else {
        res.json({
          configured: false,
          message: 'AWS credentials not configured. Please add AWS secrets to enable video uploads.'
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
        console.error('[Upload] AWS service not configured');
        return res.status(400).json({ 
          message: "AWS service not configured. Please add AWS secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME, AWS_CLOUDFRONT_DOMAIN) to enable uploads."
        });
      }

      const { filename, contentType, videoId } = req.body;
      if (!filename || !videoId) {
        console.error('[Upload] Missing required fields:', { filename: !!filename, videoId: !!videoId });
        return res.status(400).json({ message: "Filename and videoId are required" });
      }

      const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `inputs/${videoId}/${sanitized}`;
      
      console.log('[Upload] Generating presigned URL for:', key);
      const uploadUrl = await awsService.getPresignedUploadUrl(key, contentType || 'video/mp4');
      
      const hlsUrl = awsService.getCloudFrontUrl(videoId, sanitized);
      
      console.log('[Upload] Presigned URL generated successfully');
      res.json({ 
        uploadUrl, 
        s3Key: key,
        hlsUrl
      });
    } catch (error: any) {
      console.error('[Upload] Error generating presigned URL:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate upload URL',
        details: error.toString()
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
