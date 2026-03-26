import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Organization, User, Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, Users, Calendar, Copy, CheckCircle, Clock, ListTodo } from "lucide-react";
import { toast } from "sonner";

export default function AdminOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    Promise.all([
      api.getOrganization(id),
      api.getMembers(id),
      api.getTasks(user.id, id),
    ]).then(([o, m, t]) => {
      setOrg(o);
      setMembers(m);
      setTasks(t);
      setLoading(false);
    });
  }, [id, user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!org) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="text-muted-foreground mb-4">Organization not found.</p>
          <Button variant="outline" onClick={() => navigate("/admin/organization")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Organizations
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/organization")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Organizations
        </Button>

        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold">{org.name}</h1>
                <p className="text-sm text-muted-foreground">{org.description || "No description"}</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">{org.inviteCode}</code>
                <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(org.inviteCode); toast.success("Copied!"); }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="font-bold">{members.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                  <p className="font-bold">{stats.total}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="font-bold">{stats.done}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-info" />
                <div>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                  <p className="font-bold">{stats.inProgress}</p>
                </div>
              </div>
              {org.sector && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sector</p>
                    <p className="font-bold text-sm">{org.sector}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Users className="w-4 h-4" /> Team Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {members.map((member) => {
                  const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
                  const completedCount = memberTasks.filter((t) => t.status === "done").length;
                  return (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs gradient-primary text-primary-foreground">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{completedCount}/{memberTasks.length} tasks</p>
                        <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-[10px]">
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <ListTodo className="w-4 h-4" /> Tasks ({tasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No tasks yet</p>
                ) : (
                  tasks.slice(0, 20).map((task) => {
                    const assignee = members.find((m) => m.id === task.assigneeId);
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === "done" ? "bg-success" : task.status === "in-progress" ? "bg-info" : task.status === "review" ? "bg-warning" : "bg-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {assignee ? assignee.name : "Unassigned"} · {task.priority}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{task.status}</Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
