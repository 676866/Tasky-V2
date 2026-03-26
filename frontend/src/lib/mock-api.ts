import { Task, Organization, User, TaskStatus, Notification, Reminder } from "@/types";
import { mockTasks, mockUsers, mockOrganizations, mockNotifications, mockReminders } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let tasks = [...mockTasks];
let organizations = [...mockOrganizations];
let users = [...mockUsers];
let notifications = [...mockNotifications];
let reminders = [...mockReminders];

export const api = {
  // Auth
  async login(email: string, _password: string): Promise<User | null> {
    await delay(500);
    return users.find((u) => u.email === email) || null;
  },

  async signup(name: string, email: string, _password: string): Promise<User> {
    await delay(500);
    const user: User = {
      id: `u${Date.now()}`,
      email,
      name,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },

  // Tasks
  async getTasks(userId: string, orgId?: string): Promise<Task[]> {
    await delay(300);
    return tasks.filter(
      (t) =>
        t.creatorId === userId ||
        t.assigneeId === userId ||
        (orgId && t.organizationId === orgId)
    );
  },

  async getTasksByOrg(orgId: string): Promise<Task[]> {
    await delay(300);
    return tasks.filter((t) => t.organizationId === orgId);
  },

  async createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    await delay(300);
    const newTask: Task = {
      ...task,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    // If assigned, create a notification
    if (newTask.assigneeId && newTask.assigneeId !== newTask.creatorId) {
      const sender = users.find((u) => u.id === newTask.creatorId);
      notifications.push({
        id: `n${Date.now()}`,
        userId: newTask.assigneeId,
        title: "New Task Assigned",
        message: `${sender?.name || "Someone"} assigned you "${newTask.title}"`,
        type: "assignment",
        read: false,
        taskId: newTask.id,
        createdAt: new Date().toISOString(),
      });
    }
    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await delay(200);
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Task not found");
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    return tasks[idx];
  },

  async deleteTask(id: string): Promise<void> {
    await delay(200);
    tasks = tasks.filter((t) => t.id !== id);
  },

  async moveTask(id: string, status: TaskStatus): Promise<Task> {
    return api.updateTask(id, { status });
  },

  // Organizations
  async getOrganization(id: string): Promise<Organization | null> {
    await delay(200);
    return organizations.find((o) => o.id === id) || null;
  },

  async getOrganizations(): Promise<Organization[]> {
    await delay(200);
    return organizations;
  },

  async createOrganization(name: string, description: string, ownerId: string): Promise<Organization> {
    await delay(400);
    const org: Organization = {
      id: `org${Date.now()}`,
      name,
      description,
      inviteCode: `${name.toUpperCase().replace(/\s+/g, "").slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      ownerId,
      memberIds: [ownerId],
      createdAt: new Date().toISOString(),
    };
    organizations.push(org);
    const userIdx = users.findIndex((u) => u.id === ownerId);
    if (userIdx !== -1) {
      users[userIdx] = { ...users[userIdx], organizationId: org.id, role: "admin" };
    }
    return org;
  },

  async joinOrganization(inviteCode: string, userId: string): Promise<Organization | null> {
    await delay(400);
    const org = organizations.find((o) => o.inviteCode === inviteCode);
    if (!org) return null;
    if (!org.memberIds.includes(userId)) {
      org.memberIds.push(userId);
    }
    const userIdx = users.findIndex((u) => u.id === userId);
    if (userIdx !== -1) {
      users[userIdx] = { ...users[userIdx], organizationId: org.id };
    }
    return org;
  },

  async getMembers(orgId: string): Promise<User[]> {
    await delay(200);
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return [];
    return users.filter((u) => org.memberIds.includes(u.id));
  },

  async getUsers(): Promise<User[]> {
    await delay(200);
    return users;
  },

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    await delay(200);
    return notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async markNotificationRead(id: string): Promise<void> {
    await delay(100);
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx !== -1) notifications[idx] = { ...notifications[idx], read: true };
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await delay(100);
    notifications = notifications.map((n) => n.userId === userId ? { ...n, read: true } : n);
  },

  // Reminders
  async sendReminder(taskId: string, senderId: string, recipientId: string, message: string, organizationId: string): Promise<Reminder> {
    await delay(300);
    const reminder: Reminder = {
      id: `r${Date.now()}`,
      taskId,
      senderId,
      recipientId,
      message,
      organizationId,
      createdAt: new Date().toISOString(),
    };
    reminders.push(reminder);
    // Create notification for recipient
    const task = tasks.find((t) => t.id === taskId);
    const sender = users.find((u) => u.id === senderId);
    notifications.push({
      id: `n${Date.now()}`,
      userId: recipientId,
      title: "Task Reminder",
      message: `${sender?.name}: ${message}${task ? ` — "${task.title}"` : ""}`,
      type: "reminder",
      read: false,
      taskId,
      createdAt: new Date().toISOString(),
    });
    return reminder;
  },

  async getReminders(orgId: string): Promise<Reminder[]> {
    await delay(200);
    return reminders.filter((r) => r.organizationId === orgId);
  },
};
