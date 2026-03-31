import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.routes";
import { organizationRouter } from "./routes/organization.routes";
import { taskRouter } from "./routes/task.routes";
import { membershipRouter } from "./routes/membership.routes";
import { reminderRouter } from "./routes/reminder.routes";
import { notificationRouter } from "./routes/notification.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "https://tasky-v2-three.vercel.app/"
)
  .split(",")
  .map((o) => o.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin))
        return cb(null, origin || true);
      return cb(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/organizations", organizationRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/memberships", membershipRouter);
app.use("/api/reminders", reminderRouter);
app.use("/api/notifications", notificationRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Tasky server running on port ${PORT}`);
});

export default app;
