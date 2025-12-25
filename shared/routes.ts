import { z } from 'zod';
import { insertUserSchema, insertKycRequestSchema, kycRequests, users } from './schema';

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ email: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    signup: {
      method: 'POST' as const,
      path: '/api/signup',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
  },
  kyc: {
    list: {
        method: 'GET' as const,
        path: '/api/kyc',
        responses: {
            200: z.array(z.custom<typeof kycRequests.$inferSelect>()),
        }
    },
    get: {
        method: 'GET' as const,
        path: '/api/kyc/:id',
        responses: {
            200: z.custom<typeof kycRequests.$inferSelect>(),
            404: z.object({ message: z.string() }),
        }
    },
    create: {
        method: 'POST' as const,
        path: '/api/kyc',
        input: insertKycRequestSchema,
        responses: {
            201: z.custom<typeof kycRequests.$inferSelect>(),
        }
    },
    update: {
        method: 'PUT' as const,
        path: '/api/kyc/:id',
        input: insertKycRequestSchema.partial(),
        responses: {
            200: z.custom<typeof kycRequests.$inferSelect>(),
        }
    }
  },
  admin: {
    stats: {
        method: 'GET' as const,
        path: '/api/admin/stats',
        responses: {
            200: z.object({
                total: z.number(),
                approved: z.number(),
                pending: z.number(),
                reviewRequired: z.number(),
                riskDistribution: z.array(z.object({ name: z.string(), value: z.number() })),
                requestsOverTime: z.array(z.object({ date: z.string(), requests: z.number() })),
            }),
        }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
