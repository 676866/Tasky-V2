export type UserRole = "admin" | "user";
export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId?: string;
  onboardingCompleted?: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  groupSize?: string;
  sector?: string;
  inviteCode: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  creatorId: string;
  organizationId?: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "reminder" | "assignment" | "update" | "info";
  read: boolean;
  taskId?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  taskId: string;
  senderId: string;
  recipientId: string;
  message: string;
  organizationId: string;
  createdAt: string;
}

export interface OnboardingData {
  role: UserRole;
  organizationName?: string;
  inviteCode?: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  memberCount?: number;
}
