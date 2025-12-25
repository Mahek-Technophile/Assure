import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Auth Routes ===
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.signup.path, async (req, res) => {
    try {
      const input = api.auth.signup.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
       if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: err.errors[0].message,
          });
        }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === KYC Routes ===
  app.get(api.kyc.list.path, async (req, res) => {
    const requests = await storage.getKycRequests();
    res.json(requests);
  });

  app.get(api.kyc.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const request = await storage.getKycRequest(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  });

  app.post(api.kyc.create.path, async (req, res) => {
    try {
      const input = api.kyc.create.input.parse(req.body);
      const request = await storage.createKycRequest(input);
      res.status(201).json(request);
    } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: err.errors[0].message,
          });
        }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put(api.kyc.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.kyc.update.input.parse(req.body);
      const request = await storage.updateKycRequest(id, input);
      res.json(request);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === Admin Stats ===
  app.get(api.admin.stats.path, async (req, res) => {
    const requests = await storage.getKycRequests();
    
    const stats = {
      total: requests.length,
      approved: requests.filter(r => r.status === 'Completed').length,
      pending: requests.filter(r => r.status === 'In Progress').length,
      reviewRequired: requests.filter(r => r.status === 'Needs Review' || r.status === 'PendingReview').length,
      riskDistribution: [
        { name: 'Low', value: requests.filter(r => r.riskLevel === 'Low').length },
        { name: 'Medium', value: requests.filter(r => r.riskLevel === 'Medium').length },
        { name: 'High', value: requests.filter(r => r.riskLevel === 'High').length },
      ],
      requestsOverTime: [
        { date: '2025-05-01', requests: 12 },
        { date: '2025-05-02', requests: 19 },
        { date: '2025-05-03', requests: 15 },
        { date: '2025-05-04', requests: 25 },
        { date: '2025-05-05', requests: 32 },
      ]
    };
    
    res.json(stats);
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingUsers = await storage.getUserByEmail("demo@example.com");
  if (!existingUsers) {
    const user = await storage.createUser({
      email: "demo@example.com",
      password: "password",
      fullName: "Demo User",
      role: "admin"
    });

    // Seed realistic KYC data
    await storage.createKycRequest({
      userId: user.id,
      kycId: "KYC-2025-001",
      status: "Needs Review",
      riskLevel: "Medium",
      confidenceScore: 82,
      aiExplanation: "The identity document appears valid, but location mismatch and device behavior anomalies require manual review.",
      currentStep: 4,
      data: {
        personalInfo: {
          name: "Amit Sharma",
          email: "amit.sharma@example.com",
          phone: "+91 98765 43210",
          dob: "1990-05-15",
          address: "123, Tech Park Road, Bangalore"
        },
        documents: {
          type: "Passport",
          extractedData: {
            name: 0.94,
            dob: 0.91
          }
        },
        signals: {
          location: "Mumbai, India",
          device: "Unknown Android Device",
          ipReputation: "Suspicious Proxy"
        }
      }
    });

    await storage.createKycRequest({
        userId: user.id,
        kycId: "KYC-2025-002",
        status: "Completed",
        riskLevel: "Low",
        confidenceScore: 98,
        aiExplanation: "All biometric and document signals match. No risk flags detected.",
        currentStep: 5,
        data: {
          personalInfo: {
            name: "Sarah Jenkins",
            email: "sarah.j@example.com",
            phone: "+1 555 0123",
            dob: "1988-11-22",
            address: "456 Maple Ave, Seattle, WA"
          },
          documents: {
            type: "Driver's License",
          }
        }
      });

      await storage.createKycRequest({
        userId: user.id,
        kycId: "KYC-2025-003",
        status: "In Progress",
        riskLevel: "Low",
        confidenceScore: 0,
        aiExplanation: "Awaiting document upload.",
        currentStep: 2,
        data: {
          personalInfo: {
            name: "Rahul Verma",
            email: "rahul.v@example.com",
            phone: "+91 99999 88888",
            dob: "1995-02-10",
            address: "789 Residency Rd, Hyderabad"
          }
        }
      });
  }
}
