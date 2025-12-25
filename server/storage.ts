import { db } from "./db";
import {
  users,
  kycRequests,
  type User,
  type InsertUser,
  type KycRequest,
  type InsertKycRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // KYC operations
  getKycRequests(): Promise<KycRequest[]>;
  getKycRequest(id: number): Promise<KycRequest | undefined>;
  getKycRequestByUserId(userId: number): Promise<KycRequest | undefined>;
  createKycRequest(request: InsertKycRequest): Promise<KycRequest>;
  updateKycRequest(id: number, updates: Partial<InsertKycRequest>): Promise<KycRequest>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getKycRequests(): Promise<KycRequest[]> {
    return await db.select().from(kycRequests).orderBy(desc(kycRequests.createdAt));
  }

  async getKycRequest(id: number): Promise<KycRequest | undefined> {
    const [request] = await db.select().from(kycRequests).where(eq(kycRequests.id, id));
    return request;
  }

  async getKycRequestByUserId(userId: number): Promise<KycRequest | undefined> {
    const [request] = await db.select().from(kycRequests).where(eq(kycRequests.userId, userId));
    return request;
  }

  async createKycRequest(insertRequest: InsertKycRequest): Promise<KycRequest> {
    const [request] = await db.insert(kycRequests).values(insertRequest).returning();
    return request;
  }

  async updateKycRequest(id: number, updates: Partial<InsertKycRequest>): Promise<KycRequest> {
    const [request] = await db
      .update(kycRequests)
      .set(updates)
      .where(eq(kycRequests.id, id))
      .returning();
    return request;
  }
}

export const storage = new DatabaseStorage();
