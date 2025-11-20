import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Video,
  type InsertVideo,
  type AwsConfig,
  type InsertAwsConfig,
  users,
  videos,
  awsConfig,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video methods
  getAllVideos(): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<void>;
  
  // AWS Config methods
  getAwsConfig(): Promise<AwsConfig | undefined>;
  upsertAwsConfig(config: InsertAwsConfig): Promise<AwsConfig>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle({ client: pool });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Video methods
  async getAllVideos(): Promise<Video[]> {
    return this.db.select().from(videos).orderBy(desc(videos.createdAt));
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const result = await this.db.select().from(videos).where(eq(videos.id, id));
    return result[0];
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const result = await this.db.insert(videos).values(video).returning();
    return result[0];
  }

  async updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video | undefined> {
    const result = await this.db
      .update(videos)
      .set({ ...video, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return result[0];
  }

  async deleteVideo(id: string): Promise<void> {
    await this.db.delete(videos).where(eq(videos.id, id));
  }

  // AWS Config methods
  async getAwsConfig(): Promise<AwsConfig | undefined> {
    const result = await this.db.select().from(awsConfig).limit(1);
    return result[0];
  }

  async upsertAwsConfig(config: InsertAwsConfig): Promise<AwsConfig> {
    const existing = await this.getAwsConfig();
    
    if (existing) {
      const result = await this.db
        .update(awsConfig)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(awsConfig.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(awsConfig).values(config).returning();
      return result[0];
    }
  }
}

export const storage = new DatabaseStorage();
