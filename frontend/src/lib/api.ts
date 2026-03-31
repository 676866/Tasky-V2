import {
  Task,
  Organization,
  User,
  TaskStatus,
  Notification,
  Reminder,
} from "@/types";
import { useAuthStore } from "@/store/auth-store";

const getBaseUrl = () =>
  import.meta.env.VITE_API_URL || "https://tasky-v2-xa6g.vercel.app";
const getToken = () => useAuthStore.getState().token;

function toFrontendStatus(s: string): TaskStatus {
  const map: Record<string, TaskStatus> = {
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    REVIEW: "review",
    DONE: "done",
  };
  return map[s] ?? (s as TaskStatus);
}
function toFrontendPriority(p: string): TaskPriority {
  const map: Record<string, TaskPriority> = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    URGENT: "urgent",
  };
  return map[p] ?? (p as TaskPriority);
}
type TaskPriority = "low" | "medium" | "high" | "urgent";

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {},
): Promise<T> {
  const { params, ...init } = options;
  const base = getBaseUrl().replace(/\/$/, "");
  const url = new URL(
    path.startsWith("/") ? `${base}${path}` : `${base}/${path}`,
  );
  if (params)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token)
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) {
      useAuthStore.getState().logout();
    }
    throw new Error(data?.error ?? res.statusText);
  }
  return data as T;
}

function mapTask(t: {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assigneeId?: string | null;
  creatorId: string;
  organizationId?: string | null;
  dueDate?: string | null;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    status: toFrontendStatus(t.status),
    priority: toFrontendPriority(t.priority),
    assigneeId: t.assigneeId ?? undefined,
    creatorId: t.creatorId,
    organizationId: t.organizationId ?? undefined,
    dueDate: t.dueDate ?? undefined,
    tags: Array.isArray(t.tags) ? t.tags : [],
    createdAt:
      typeof t.createdAt === "string"
        ? t.createdAt
        : (t.createdAt as unknown as Date).toISOString?.(),
    updatedAt:
      typeof t.updatedAt === "string"
        ? t.updatedAt
        : (t.updatedAt as unknown as Date).toISOString?.(),
  };
}

function mapOrg(o: {
  id: string;
  name: string;
  description?: string | null;
  groupSize?: string | null;
  sector?: string | null;
  inviteCode: string;
  ownerId: string;
  memberships?: { user: { id: string } }[];
  createdAt: string;
}): Organization {
  const memberIds = o.memberships?.map((m) => m.user.id) ?? [];
  return {
    id: o.id,
    name: o.name,
    description: o.description ?? undefined,
    groupSize: o.groupSize ?? undefined,
    sector: o.sector ?? undefined,
    inviteCode: o.inviteCode,
    ownerId: o.ownerId,
    memberIds,
    createdAt:
      typeof o.createdAt === "string"
        ? o.createdAt
        : (o.createdAt as unknown as Date).toISOString?.(),
  };
}

function mapUser(u: {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
  createdAt?: string | Date | null;
  organizationId?: string | null;
  onboardingCompleted?: boolean | null;
}): User {
  const createdAt =
    u.createdAt == null
      ? new Date().toISOString()
      : typeof u.createdAt === "string"
        ? u.createdAt
        : ((u.createdAt as Date).toISOString?.() ?? new Date().toISOString());
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatar: u.avatar ?? undefined,
    role: u.role === "ADMIN" ? "admin" : "user",
    organizationId: u.organizationId ?? undefined,
    onboardingCompleted: u.onboardingCompleted ?? false,
    createdAt,
  };
}

function mapNotification(n: {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  taskId?: string | null;
  createdAt: string;
}): Notification {
  const typeMap: Record<string, Notification["type"]> = {
    REMINDER: "reminder",
    ASSIGNMENT: "assignment",
    UPDATE: "update",
    INFO: "info",
  };
  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: typeMap[n.type] ?? "info",
    read: n.read,
    taskId: n.taskId ?? undefined,
    createdAt:
      typeof n.createdAt === "string"
        ? n.createdAt
        : (n.createdAt as unknown as Date).toISOString?.(),
  };
}

function mapReminder(r: {
  id: string;
  taskId: string;
  senderId: string;
  recipientId: string;
  message: string;
  organizationId: string;
  createdAt: string;
}): Reminder {
  return {
    id: r.id,
    taskId: r.taskId,
    senderId: r.senderId,
    recipientId: r.recipientId,
    message: r.message,
    organizationId: r.organizationId,
    createdAt:
      typeof r.createdAt === "string"
        ? r.createdAt
        : (r.createdAt as unknown as Date).toISOString?.(),
  };
}

export const api = {
  // Auth (used for fallback or token refresh)
  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    const data = await request<{ user: unknown; token: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    return {
      user: mapUser(data.user as Parameters<typeof mapUser>[0]),
      token: data.token,
    };
  },

  async checkEmail(email: string): Promise<{ available: boolean }> {
    const data = await request<{ available: boolean }>(
      "/api/auth/check-email",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
    return data;
  },

  async sendOtp(email: string): Promise<void> {
    await request("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async signup(
    name: string,
    email: string,
    password: string,
    otp: string,
    role?: "USER" | "ADMIN",
  ): Promise<{ user: User; token: string }> {
    const data = await request<{ user: unknown; token: string }>(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          otp,
          role: role ?? "USER",
        }),
      },
    );
    return {
      user: mapUser(data.user as Parameters<typeof mapUser>[0]),
      token: data.token,
    };
  },

  async completeOnboarding(): Promise<void> {
    await request("/api/auth/onboarding-complete", { method: "POST" });
  },

  async neonSession(
    email: string,
    name: string,
  ): Promise<{ user: User; token: string }> {
    const data = await request<{ user: unknown; token: string }>(
      "/api/auth/neon-session",
      {
        method: "POST",
        body: JSON.stringify({ email, name }),
      },
    );
    return {
      user: mapUser(data.user as Parameters<typeof mapUser>[0]),
      token: data.token,
    };
  },

  async getMe(): Promise<User> {
    const data = await request<unknown>("/api/auth/me");
    return mapUser(data as Parameters<typeof mapUser>[0]);
  },

  // Tasks
  async getTasks(userId: string, orgId?: string): Promise<Task[]> {
    const params: Record<string, string> = {};
    if (orgId) params.organizationId = orgId;
    const list = await request<unknown[]>("/api/tasks", {
      params: Object.keys(params).length ? params : undefined,
    });
    return (list ?? []).map((t) => mapTask(t as Parameters<typeof mapTask>[0]));
  },

  async getTasksByOrg(orgId: string): Promise<Task[]> {
    return api.getTasks("", orgId);
  },

  async createTask(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ): Promise<Task> {
    const body = {
      title: task.title,
      description: task.description,
      status: task.status.toUpperCase().replace("-", "_"),
      priority: task.priority.toUpperCase(),
      assigneeId: task.assigneeId || undefined,
      organizationId: task.organizationId || undefined,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
      tags: task.tags ?? [],
    };
    const data = await request<unknown>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapTask(data as Parameters<typeof mapTask>[0]);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const body: Record<string, unknown> = {};
    if (updates.title !== undefined) body.title = updates.title;
    if (updates.description !== undefined)
      body.description = updates.description;
    if (updates.status !== undefined)
      body.status = updates.status.toUpperCase().replace("-", "_");
    if (updates.priority !== undefined)
      body.priority = updates.priority.toUpperCase();
    if (updates.assigneeId !== undefined) body.assigneeId = updates.assigneeId;
    if (updates.organizationId !== undefined)
      body.organizationId = updates.organizationId;
    if (updates.dueDate !== undefined)
      body.dueDate = updates.dueDate
        ? new Date(updates.dueDate).toISOString()
        : undefined;
    if (updates.tags !== undefined) body.tags = updates.tags;
    const data = await request<unknown>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return mapTask(data as Parameters<typeof mapTask>[0]);
  },

  async deleteTask(id: string): Promise<void> {
    await request(`/api/tasks/${id}`, { method: "DELETE" });
  },

  async moveTask(id: string, status: TaskStatus): Promise<Task> {
    return api.updateTask(id, { status });
  },

  // Organizations
  async getOrganization(id: string): Promise<Organization | null> {
    try {
      const data = await request<unknown>(`/api/organizations/${id}`);
      return mapOrg(data as Parameters<typeof mapOrg>[0]);
    } catch {
      return null;
    }
  },

  async getOrganizations(): Promise<Organization[]> {
    const list = await request<unknown[]>("/api/organizations");
    return (list ?? []).map((o) => mapOrg(o as Parameters<typeof mapOrg>[0]));
  },

  async createOrganization(
    name: string,
    description: string,
    ownerId: string,
    groupSize?: string,
    sector?: string,
  ): Promise<Organization> {
    const data = await request<unknown>("/api/organizations", {
      method: "POST",
      body: JSON.stringify({ name, description, groupSize, sector }),
    });
    return mapOrg(data as Parameters<typeof mapOrg>[0]);
  },

  async joinOrganization(
    inviteCode: string,
    _userId: string,
  ): Promise<Organization | null> {
    try {
      const data = await request<{ organization?: unknown }>(
        "/api/memberships/join",
        {
          method: "POST",
          body: JSON.stringify({ inviteCode }),
        },
      );
      const org = (data as { organization?: unknown }).organization ?? data;
      return org ? mapOrg(org as Parameters<typeof mapOrg>[0]) : null;
    } catch {
      return null;
    }
  },

  async getMembers(orgId: string): Promise<User[]> {
    const list = await request<{ user?: unknown }[]>(
      `/api/memberships/${orgId}/members`,
    );
    return (list ?? [])
      .filter((m) => m?.user)
      .map((m) => mapUser(m.user as Parameters<typeof mapUser>[0]));
  },

  async getUsers(): Promise<User[]> {
    const orgs = await api.getOrganizations();
    const all: User[] = [];
    for (const org of orgs) {
      const members = await api.getMembers(org.id);
      for (const u of members) {
        if (!all.some((x) => x.id === u.id)) all.push(u);
      }
    }
    return all;
  },

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    const list = await request<unknown[]>("/api/notifications");
    return (list ?? [])
      .map((n) => mapNotification(n as Parameters<typeof mapNotification>[0]))
      .filter((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },

  async markNotificationRead(id: string): Promise<void> {
    await request(`/api/notifications/${id}/read`, { method: "PATCH" });
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await request("/api/notifications/read-all", { method: "PATCH" });
  },

  // Reminders
  async sendReminder(
    taskId: string,
    senderId: string,
    recipientId: string,
    message: string,
    organizationId: string,
  ): Promise<Reminder> {
    const data = await request<unknown>("/api/reminders", {
      method: "POST",
      body: JSON.stringify({ taskId, recipientId, message, organizationId }),
    });
    return mapReminder(data as Parameters<typeof mapReminder>[0]);
  },

  async getReminders(orgId: string): Promise<Reminder[]> {
    const list = await request<unknown[]>(`/api/reminders/${orgId}`);
    return (list ?? []).map((r) =>
      mapReminder(r as Parameters<typeof mapReminder>[0]),
    );
  },
};
