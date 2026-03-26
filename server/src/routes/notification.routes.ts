import { Router } from "express";
import { getNotifications, markRead, markAllRead } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get("/", getNotifications);
notificationRouter.patch("/:id/read", markRead);
notificationRouter.patch("/read-all", markAllRead);
