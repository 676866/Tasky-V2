import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ListTodo, Target } from "lucide-react";

const STATUS_COLORS = ["#6366f1", "#f59e0b", "#8b5cf6", "#22c55e"];

const statusConfig: ChartConfig = {
  todo: { label: "To Do", color: "#6366f1" },
  "in-progress": { label: "In Progress", color: "#f59e0b" },
  review: { label: "Review", color: "#8b5cf6" },
  done: { label: "Done", color: "#22c55e" },
};

function statusCounts(tasks: Task[]) {
  const counts: Record<string, number> = { todo: 0, "in-progress": 0, review: 0, done: 0 };
  tasks.forEach((t) => {
    if (t.status in counts) counts[t.status]++;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function last7DaysCompletion(tasks: Task[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const out = days.map((name, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = tasks.filter((t) => {
      if (t.status !== "done" || !t.updatedAt) return false;
      const up = new Date(t.updatedAt);
      return up >= d && up < next;
    }).length;
    return { name, completed: count, day: d.toISOString().slice(0, 10) };
  });
  return out;
}

export default function UserAnalyticsPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.getTasks(user.id).then((t) => {
      setTasks(t);
      setLoading(false);
    });
  }, [user]);

  const byStatus = statusCounts(tasks);
  const completionByDay = last7DaysCompletion(tasks);
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

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
        <h1 className="text-2xl font-display font-bold">My Analytics</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">Personal tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{done}</div>
              <p className="text-xs text-muted-foreground">Marked done</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Of all tasks</p>
            </CardContent>
          </Card>
        </div>

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
              <CardTitle className="text-lg">Completed This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ completed: { label: "Completed", color: "hsl(var(--primary))" } }} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionByDay} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [value, "Completed"]} />
                    <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
