import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { useAdminStore } from "@/store/admin-store";
import { api } from "@/lib/api";
import { Task, DashboardStats, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, ListTodo, AlertTriangle, Bell, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SendReminderDialog } from "@/components/admin/SendReminderDialog";
import { toast } from "sonner";
import { AdminOrgSelector } from "@/components/admin/AdminOrgSelector";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { selectedOrgId } = useAdminStore();
  const orgId = selectedOrgId || user?.organizationId;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminderOpen, setReminderOpen] = useState(false);
  const navigate = useNavigate();

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

  const stats: DashboardStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "done").length,
    inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
    overdueTasks: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length,
    memberCount: members.length,
  };

  const statCards = [
    { title: "Total Tasks", value: stats.totalTasks, icon: ListTodo, color: "text-primary" },
    { title: "Completed", value: stats.completedTasks, icon: CheckCircle, color: "text-success" },
    { title: "In Progress", value: stats.inProgressTasks, icon: Clock, color: "text-info" },
    { title: "Overdue", value: stats.overdueTasks, icon: AlertTriangle, color: "text-destructive" },
    { title: "Members", value: stats.memberCount || 0, icon: Users, color: "text-accent" },
  ];

  const handleSendReminder = async (taskId: string, recipientId: string, message: string) => {
    if (!orgId) return;
    await api.sendReminder(taskId, user!.id, recipientId, message, orgId);
    toast.success("Reminder sent!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground">Here's what's happening with your organization.</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminOrgSelector />
            <Button variant="outline" onClick={() => setReminderOpen(true)} disabled={!orgId}>
              <Bell className="w-4 h-4 mr-2" /> Send Reminder
            </Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={() => navigate("/admin/board")}>
              Open Board
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <Card key={s.title} className="hover-lift">
              <CardContent className="p-5">
                {loading ? (
                  <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-8 w-12" /></div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{s.title}</p>
                      <p className="text-3xl font-bold mt-1">{s.value}</p>
                    </div>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${task.status === "done" ? "bg-success" : task.status === "in-progress" ? "bg-info" : "bg-muted-foreground"}`} />
                      <span className="text-sm font-medium">{task.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === "urgent" ? "bg-destructive/10 text-destructive" : task.priority === "high" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <SendReminderDialog
          open={reminderOpen}
          onOpenChange={setReminderOpen}
          onSubmit={handleSendReminder}
          tasks={tasks.filter((t) => t.status !== "done")}
          members={members.filter((m) => m.id !== user?.id)}
        />
      </div>
    </DashboardLayout>
  );
}
