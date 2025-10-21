import z, { ZodType } from "zod";

export class ApplicationValidation {
  static readonly CREATE: ZodType = z.object({
    companyName: z.string().min(3).max(100),
    position: z.string().min(3).max(100),
    status: z.enum(["applied", "interview", "offer", "rejected"]),
    appliedAt: z.string(),
    notes: z.string().optional(),
  });

  static readonly GETBYID: ZodType = z.object({
    id: z.number().positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    companyName: z.string().min(3).max(100),
    position: z.string().min(3).max(100),
    status: z.enum(["applied", "interview", "offer", "rejected"]),
    appliedAt: z.string(),
    notes: z.string().optional(),
  });

  static readonly FILTER: ZodType = z.object({
    status: z.enum(["applied", "interview", "offer", "rejected"]).optional(),
    position: z.string().optional(),
    appliedAt: z.string().optional(),
  });

  static readonly PAGINATION: ZodType = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  });
}
