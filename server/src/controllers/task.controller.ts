import { Response } from "express";
import { TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { createTaskSchema, updateTaskSchema } from "../utils/validation";

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createTaskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: { ...data, creatorId: req.userId!, tags: data.tags || [] },
      include: { assignee: { select: { id: true, name: true } }, creator: { select: { id: true, name: true } } },
    });

    // Create notification for assignee
    if (task.assigneeId && task.assigneeId !== req.userId) {
      const sender = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } });
      await prisma.notification.create({
        data: {
          title: "New Task Assigned",
          message: `${sender?.name} assigned you "${task.title}"`,
          type: "ASSIGNMENT",
          userId: task.assigneeId,
          taskId: task.id,
        },
      });
    }

    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { organizationId, status, priority, assigneeId } = req.query;
    const where: Record<string, unknown> = {};

    if (organizationId && typeof organizationId === "string") {
      where.organizationId = organizationId;
      // Non-admin members only see tasks assigned to them; admin/owner see all org tasks
      const isOrgAdmin =
        (await prisma.organization.findFirst({
          where: { id: organizationId, ownerId: req.userId! },
          select: { id: true },
        })) != null ||
        (await prisma.membership.findFirst({
          where: { organizationId, userId: req.userId!, role: "ADMIN" },
          select: { id: true },
        })) != null;
      if (!isOrgAdmin) {
        where.assigneeId = req.userId;
      }
    } else {
      where.OR = [{ creatorId: req.userId }, { assigneeId: req.userId }];
      where.organizationId = null;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: { assignee: { select: { id: true, name: true } }, creator: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    let data = updateTaskSchema.parse(req.body);
    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: { status: true, organizationId: true, title: true },
    });
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    if (existing.status === "DONE" && data.status !== undefined && data.status !== "DONE") {
      res.status(400).json({ error: "Cannot change status once task is marked done" });
      return;
    }
    if (existing.status === "DONE") {
      data = { ...data, status: "DONE" as TaskStatus };
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { ...data },
      include: { assignee: { select: { id: true, name: true } }, creator: { select: { id: true, name: true } } },
    });

    const becameDone = task.status === "DONE" && (existing.status as TaskStatus) !== "DONE";
    if (becameDone && task.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: task.organizationId },
        select: { ownerId: true },
      });
      if (org && org.ownerId !== req.userId) {
        const withRelations = task as typeof task & { assignee?: { name: string }; creator?: { name: string } };
        const assigneeName = withRelations.assignee?.name ?? withRelations.creator?.name ?? "Someone";
        await prisma.notification.create({
          data: {
            title: "Task completed",
            message: `${assigneeName} completed "${task.title}"`,
            type: "UPDATE",
            userId: org.ownerId,
            taskId: task.id,
          },
        });
      }
    }

    res.json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: "Task deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
