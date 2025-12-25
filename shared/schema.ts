import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"), // user | admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const kycRequests = pgTable("kyc_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  kycId: text("kyc_id").notNull(), // Display ID like KYC-2025-001
  status: text("status").notNull().default("In Progress"), // Verified, In Progress, Needs Review, PendingReview
  riskLevel: text("risk_level").default("Low"), // Low, Medium, High
  confidenceScore: integer("confidence_score").default(0),
  aiExplanation: text("ai_explanation"),
  currentStep: integer("current_step").default(1),
  // JSONB data to hold flexible form data and mock signals
  data: jsonb("data").$type<{
    personalInfo?: {
        name: string;
        email: string;
        phone: string;
        dob: string;
        address: string;
    };
    documents?: {
        type: string;
        frontUrl?: string;
        backUrl?: string;
        extractedData?: Record<string, any>;
    };
    biometrics?: {
        faceScanUrl?: string;
        livenessScore?: number;
    };
    signals?: {
        device?: string;
        location?: string;
        ipReputation?: string;
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertKycRequestSchema = createInsertSchema(kycRequests).omit({ id: true, createdAt: true, updatedAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type KycRequest = typeof kycRequests.$inferSelect;
export type InsertKycRequest = z.infer<typeof insertKycRequestSchema>;
