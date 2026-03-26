import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { generateToken } from "../utils/jwt";
import { signupSchema, loginSchema, neonSessionSchema, checkEmailSchema, sendOtpSchema } from "../utils/validation";
import { AuthRequest } from "../middleware/auth.middleware";
import { setOtp, verifyOtp } from "../lib/otp-store";
import { sendOtpEmail } from "../lib/mailer";

/** Check if email is available (no user created). Use before signup to avoid duplicate. */
export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = checkEmailSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    res.json({ available: !existing });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/** Send OTP to email for verification. No account created. */
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = sendOtpSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    const otp = crypto.randomInt(100_000, 999_999).toString();
    setOtp(email, otp);
    try {
      await sendOtpEmail(email, otp);
    } catch (mailErr: any) {
      console.error("Send OTP email failed:", mailErr?.message);
      res.status(503).json({ error: "Could not send verification email. Check SMTP configuration." });
      return;
    }
    res.json({ success: true, message: "Verification code sent to your email" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = signupSchema.parse(req.body);
    if (!verifyOtp(data.email, data.otp)) {
      res.status(400).json({ error: "Invalid or expired verification code" });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role ?? "USER",
        onboardingCompleted: false,
      },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true, onboardingCompleted: true },
    });

    const token = generateToken(user.id);
    res.status(201).json({
      user: { ...user, organizationId: null },
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id);
    const firstMembership = await prisma.membership.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        onboardingCompleted: user.onboardingCompleted,
        organizationId: firstMembership?.organizationId ?? null,
      },
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        onboardingCompleted: true,
        memberships: { take: 1, select: { organizationId: true } },
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { memberships, ...rest } = user;
    res.json({ ...rest, organizationId: memberships[0]?.organizationId ?? null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/** Mark onboarding as completed. User must be authenticated. */
export const completeOnboarding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: { onboardingCompleted: true },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/** Sync user from Neon Auth (or other IdP) and return our JWT + user for API calls */
export const neonSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = neonSessionSchema.parse(req.body);
    let user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true, onboardingCompleted: true },
    });
    if (!user) {
      const hashedPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
      user = await prisma.user.create({
        data: { email: data.email, name: data.name, password: hashedPassword },
        select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true, onboardingCompleted: true },
      });
    }
    const firstMembership = await prisma.membership.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });
    const token = generateToken(user.id);
    res.status(200).json({
      user: { ...user, organizationId: firstMembership?.organizationId ?? null },
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
