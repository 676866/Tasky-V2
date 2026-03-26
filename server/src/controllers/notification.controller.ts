import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    res.json({ message: "Marked as read" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    });
    res.json({ message: "All marked as read" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
