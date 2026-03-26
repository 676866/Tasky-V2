import { Router } from "express";
import { sendReminder, getReminders } from "../controllers/reminder.controller";
import { authenticate } from "../middleware/auth.middleware";

export const reminderRouter = Router();

reminderRouter.use(authenticate);
reminderRouter.post("/", sendReminder);
reminderRouter.get("/:orgId", getReminders);
