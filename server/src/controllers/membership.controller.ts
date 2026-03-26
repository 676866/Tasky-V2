import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { joinOrganizationSchema } from "../utils/validation";

export const joinOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inviteCode } = joinOrganizationSchema.parse(req.body);
    const org = await prisma.organization.findUnique({ where: { inviteCode } });
    if (!org) {
      res.status(404).json({ error: "Invalid invite code" });
      return;
    }

    const existing = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: req.userId!, organizationId: org.id } },
    });
    if (existing) {
      res.status(409).json({ error: "Already a member" });
      return;
    }

    const membership = await prisma.membership.create({
      data: { userId: req.userId!, organizationId: org.id },
      include: { organization: true },
    });

    res.status(201).json(membership);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = typeof req.params.orgId === "string" ? req.params.orgId : req.params.orgId?.[0];
    const members = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } },
    });
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = typeof req.params.userId === "string" ? req.params.userId : req.params.userId?.[0];
    const orgId = typeof req.params.orgId === "string" ? req.params.orgId : req.params.orgId?.[0];
    await prisma.membership.delete({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    res.json({ message: "Member removed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
