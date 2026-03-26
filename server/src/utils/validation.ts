import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  role: z.enum(["USER", "ADMIN"]).optional().default("USER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const neonSessionSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  groupSize: z.string().optional(),
  sector: z.string().optional(),
});

export const checkEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function dueDateMinToday(d: string): boolean {
  const input = new Date(d);
  const today = new Date();
  input.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return input.getTime() >= today.getTime();
}

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.literal("TODO").optional().default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional().nullable(),
  dueDate: z
    .string()
    .optional()
    .refine((d) => !d || dueDateMinToday(d), "Due date cannot be in the past"),
  tags: z.array(z.string()).optional(),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .extend({
    status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
    dueDate: z
      .string()
      .optional()
      .refine((d) => !d || dueDateMinToday(d), "Due date cannot be in the past"),
  });

export const sendReminderSchema = z.object({
  taskId: z.string().uuid(),
  recipientId: z.string().uuid(),
  message: z.string().min(1, "Message is required"),
  organizationId: z.string().uuid(),
});

export const joinOrganizationSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});
