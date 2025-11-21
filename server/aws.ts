import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  cloudfrontDomain: string;
}

export class AwsService {
  private s3Client: S3Client | null = null;
  private config: AwsConfig | null = null;

  constructor() {
    this.initializeFromEnv();
  }

  private initializeFromEnv() {
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
          secretAccessKey: this.config.secretAccessKey,
        },
      });

      console.log('[AWS] Initialized from environment variables');
    } else {
      console.log('[AWS] Missing environment variables - AWS features disabled until secrets are configured');
    }
  }

  isInitialized(): boolean {
    return this.s3Client !== null && this.config !== null;
  }

  getConfig(): AwsConfig | null {
    return this.config;
  }

  async listBucketFiles(prefix: string = ""): Promise<any[]> {
    if (!this.s3Client || !this.config) {
      throw new Error("AWS service not initialized. Please configure AWS credentials in Secrets.");
    }

    const command = new ListObjectsV2Command({
      Bucket: this.config.bucketName,
      Prefix: prefix,
    });

    const response = await this.s3Client.send(command);
    return response.Contents || [];
  }

  async getPresignedUploadUrl(key: string, contentType: string = "video/mp4"): Promise<string> {
    if (!this.s3Client || !this.config) {
      throw new Error("AWS service not initialized. Please configure AWS credentials in Secrets.");
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  getCloudFrontUrl(videoId: string, filename: string): string {
    if (!this.config) {
      throw new Error("AWS service not initialized");
    }

    const baseFilename = filename.replace(/\.[^/.]+$/, "");
    return `https://${this.config.cloudfrontDomain}/assets/${videoId}/HLS/${baseFilename}.m3u8`;
  }

  getBucketName(): string {
    if (!this.config) {
      throw new Error("AWS service not initialized");
    }
    return this.config.bucketName;
  }
}

export const awsService = new AwsService();
