import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendReminderSchema } from "../utils/validation";

export const sendReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = sendReminderSchema.parse(req.body);
    const reminder = await prisma.reminder.create({
      data: { ...data, senderId: req.userId! },
      include: { task: { select: { title: true } }, sender: { select: { name: true } } },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        title: "Task Reminder",
        message: `${reminder.sender.name}: ${data.message} — "${reminder.task.title}"`,
        type: "REMINDER",
        userId: data.recipientId,
        taskId: data.taskId,
      },
    });

    res.status(201).json(reminder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = typeof req.params.orgId === "string" ? req.params.orgId : req.params.orgId?.[0];
    const reminders = await prisma.reminder.findMany({
      where: { organizationId: orgId },
      include: {
        task: { select: { id: true, title: true } },
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
