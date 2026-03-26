import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { useAdminStore } from "@/store/admin-store";
import { api } from "@/lib/api";
import { Task, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminOrgSelector } from "@/components/admin/AdminOrgSelector";

const STATUS_COLORS = ["#6366f1", "#f59e0b", "#8b5cf6", "#22c55e"];
const PRIORITY_COLORS = ["#94a3b8", "#3b82f6", "#f97316", "#ef4444"];

const statusConfig: ChartConfig = {
  todo: { label: "To Do", color: "#6366f1" },
  "in-progress": { label: "In Progress", color: "#f59e0b" },
  review: { label: "Review", color: "#8b5cf6" },
  done: { label: "Done", color: "#22c55e" },
};

const priorityConfig: ChartConfig = {
  low: { label: "Low", color: "#94a3b8" },
  medium: { label: "Medium", color: "#3b82f6" },
  high: { label: "High", color: "#f97316" },
  urgent: { label: "Urgent", color: "#ef4444" },
};

function statusCounts(tasks: Task[]) {
  const counts: Record<string, number> = { todo: 0, "in-progress": 0, review: 0, done: 0 };
  tasks.forEach((t) => {
    if (t.status in counts) counts[t.status]++;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function priorityCounts(tasks: Task[]) {
  const counts: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
  tasks.forEach((t) => {
    if (t.priority in counts) counts[t.priority]++;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function assigneeCounts(tasks: Task[], members: User[]) {
  const byId: Record<string, number> = {};
  tasks.forEach((t) => {
    const id = t.assigneeId || "__unassigned__";
    byId[id] = (byId[id] || 0) + 1;
  });
  return Object.entries(byId).map(([id, value]) => ({
    name: id === "__unassigned__" ? "Unassigned" : members.find((m) => m.id === id)?.name ?? id,
    value,
  }));
}

export default function AdminAnalyticsPage() {
  const { user } = useAuthStore();
  const { selectedOrgId } = useAdminStore();
  const orgId = selectedOrgId || user?.organizationId;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!orgId) {
      setTasks([]);
      setMembers([]);
      setLoading(false);
      return;
    }
    Promise.all([
      api.getTasks(user.id, orgId),
      api.getMembers(orgId),
    ]).then(([t, m]) => {
      setTasks(t);
      setMembers(m);
      setLoading(false);
    });
  }, [user, orgId]);

  const byStatus = statusCounts(tasks);
  const byPriority = priorityCounts(tasks);
  const byAssignee = assigneeCounts(tasks, members);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <AdminOrgSelector />
        </div>

        {!orgId ? (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              Select an organization to view analytics.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tasks by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={statusConfig} className="h-[280px] w-full">
                  <PieChart>
                    <Pie
                      data={byStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {byStatus.map((_, i) => (
                        <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, "Tasks"]} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tasks by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={priorityConfig} className="h-[280px] w-full">
                  <PieChart>
                    <Pie
                      data={byPriority}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {byPriority.map((_, i) => (
                        <Cell key={i} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, "Tasks"]} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Tasks by Assignee</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byAssignee} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
