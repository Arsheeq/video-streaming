import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { MediaConvertClient, CreateJobCommand, GetJobCommand } from "@aws-sdk/client-mediaconvert";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { AwsConfig } from "@shared/schema";

export class AwsService {
  private s3Client: S3Client | null = null;
  private mediaConvertClient: MediaConvertClient | null = null;
  private cloudFrontClient: CloudFrontClient | null = null;
  private config: AwsConfig | null = null;

  initialize(config: AwsConfig) {
    this.config = config;
    
    const credentials = {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    };

    this.s3Client = new S3Client({
      region: config.region,
      credentials,
    });

    this.mediaConvertClient = new MediaConvertClient({
      region: config.region,
      credentials,
      ...(config.mediaConvertEndpoint && { endpoint: config.mediaConvertEndpoint }),
    });

    this.cloudFrontClient = new CloudFrontClient({
      region: config.region,
      credentials,
    });
  }

  isInitialized(): boolean {
    return this.s3Client !== null && this.config !== null;
  }

  async listBucketFiles(prefix: string = ""): Promise<any[]> {
    if (!this.s3Client || !this.config) {
      throw new Error("AWS service not initialized. Please configure AWS credentials first.");
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
      throw new Error("AWS service not initialized");
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async startTranscodeJob(inputKey: string, outputPath: string): Promise<string> {
    if (!this.mediaConvertClient || !this.config) {
      throw new Error("AWS service not initialized");
    }

    if (!this.config.mediaConvertRole) {
      throw new Error("MediaConvert role not configured");
    }

    // This is a simplified example - you'd need to configure a proper MediaConvert job template
    const params = {
      Role: this.config.mediaConvertRole,
      Settings: {
        Inputs: [{
          FileInput: `s3://${this.config.bucketName}/${inputKey}`,
        }],
        OutputGroups: [{
          Name: "HLS",
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: {
              Destination: `s3://${this.config.bucketName}/${outputPath}`,
            },
          },
        }],
      },
    };

    const command = new CreateJobCommand(params);
    const response = await this.mediaConvertClient.send(command);
    return response.Job?.Id || "";
  }

  getVideoUrl(key: string): string {
    if (!this.config) {
      throw new Error("AWS service not initialized");
    }

    if (this.config.cloudfrontDomain) {
      return `https://${this.config.cloudfrontDomain}/${key}`;
    }
    
    return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;
  }
}

export const awsService = new AwsService();
