import { Router } from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";

export const taskRouter = Router();

taskRouter.use(authenticate);
taskRouter.post("/", createTask);
taskRouter.get("/", getTasks);
taskRouter.patch("/:id", updateTask);
taskRouter.delete("/:id", deleteTask);
