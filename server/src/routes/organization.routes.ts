import { Router } from "express";
import { createOrganization, getOrganization, getUserOrganizations } from "../controllers/organization.controller";
import { authenticate } from "../middleware/auth.middleware";

export const organizationRouter = Router();

organizationRouter.use(authenticate);
organizationRouter.post("/", createOrganization);
organizationRouter.get("/", getUserOrganizations);
organizationRouter.get("/:id", getOrganization);
