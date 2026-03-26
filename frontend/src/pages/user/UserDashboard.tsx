import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Task, Organization } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, ListTodo, AlertTriangle, Building2, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UserDashboard() {
  const { user, updateUser } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinOpen, setJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [org, setOrg] = useState<Organization | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [personal, orgTasks] = await Promise.all([
        api.getTasks(user.id),
        user.organizationId ? api.getTasks(user.id, user.organizationId) : Promise.resolve([]),
      ]);
      setTasks([...personal, ...orgTasks]);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
    if (user.organizationId) {
      api.getOrganization(user.organizationId).then(setOrg).catch(() => {});
    }
  }, [user]);

  const myTasks = tasks;
  const personalTasks = tasks.filter((t) => !t.organizationId);
  const orgTasks = tasks.filter((t) => t.organizationId === user?.organizationId);

  const stats = {
    total: myTasks.length,
    done: myTasks.filter((t) => t.status === "done").length,
    inProgress: myTasks.filter((t) => t.status === "in-progress").length,
    overdue: myTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length,
  };

  const statCards = [
    { title: "My Tasks", value: stats.total, icon: ListTodo, color: "text-primary" },
    { title: "Completed", value: stats.done, icon: CheckCircle, color: "text-success" },
    { title: "In Progress", value: stats.inProgress, icon: Clock, color: "text-info" },
    { title: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-destructive" },
  ];

  const handleJoinOrg = async () => {
    if (!user || !inviteCode.trim()) return;
    setJoining(true);
    try {
      const org = await api.joinOrganization(inviteCode, user.id);
      if (org) {
        updateUser({ organizationId: org.id });
        setOrg(org);
        toast.success(`Joined "${org.name}"!`);
        setJoinOpen(false);
        setInviteCode("");
        // Reload tasks
        const t = await api.getTasks(user.id);
        setTasks(t);
      } else {
        toast.error("Invalid invite code");
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Hey, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-sm text-muted-foreground">Here's your personal task overview.</p>
          </div>
          <div className="flex gap-2">
            {!user?.organizationId && (
              <Button variant="outline" onClick={() => setJoinOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" /> Join Organization
              </Button>
            )}
            <Button className="gradient-primary text-primary-foreground border-0" onClick={() => navigate("/dashboard/board")}>
              Open Board
            </Button>
          </div>
        </div>

        {/* Organization card */}
        {org && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold">{org.name}</p>
                <p className="text-xs text-muted-foreground">{org.description}</p>
              </div>
              <Badge variant="secondary">{orgTasks.length} assigned tasks</Badge>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Organization tasks */}
          {orgTasks.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Organization Tasks</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orgTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${task.status === "done" ? "bg-success" : task.status === "in-progress" ? "bg-info" : "bg-muted-foreground"}`} />
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{task.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal tasks */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Personal Tasks</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : personalTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No personal tasks yet</p>
              ) : (
                <div className="space-y-2">
                  {personalTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${task.status === "done" ? "bg-success" : task.status === "in-progress" ? "bg-info" : "bg-muted-foreground"}`} />
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === "urgent" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Join Organization Dialog */}
        <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Join Organization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Invite Code</Label>
                <Input placeholder="e.g. ACME-2025" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
              </div>
              <Button className="w-full gradient-primary text-primary-foreground border-0" onClick={handleJoinOrg} disabled={joining || !inviteCode.trim()}>
                {joining ? "Joining..." : "Join Organization"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
