import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { createOrganizationSchema } from "../utils/validation";
import { generateInviteCode } from "../utils/invite-code";

export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createOrganizationSchema.parse(req.body);
    const inviteCode = generateInviteCode(data.name);

    const org = await prisma.organization.create({
      data: {
        name: data.name,
        description: data.description,
        groupSize: data.groupSize ?? undefined,
        sector: data.sector ?? undefined,
        inviteCode,
        ownerId: req.userId!,
        memberships: { create: { userId: req.userId!, role: "ADMIN" } },
      },
      include: { memberships: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });

    // Update user role to ADMIN
    await prisma.user.update({ where: { id: req.userId }, data: { role: "ADMIN" } });

    res.status(201).json(org);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        memberships: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        _count: { select: { tasks: true } },
      },
    });
    if (!org) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }
    res.json(org);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId: req.userId },
      include: {
        organization: {
          include: { _count: { select: { memberships: true, tasks: true } } },
        },
      },
    });
    res.json(memberships.map((m) => ({ ...m.organization, memberRole: m.role })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
