import { Router } from "express";
import { joinOrganization, getMembers, removeMember } from "../controllers/membership.controller";
import { authenticate } from "../middleware/auth.middleware";

export const membershipRouter = Router();

membershipRouter.use(authenticate);
membershipRouter.post("/join", joinOrganization);
membershipRouter.get("/:orgId/members", getMembers);
membershipRouter.delete("/:orgId/members/:userId", removeMember);
