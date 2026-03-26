import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { useAdminStore } from "@/store/admin-store";
import { api } from "@/lib/api";
import { Task, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { AdminOrgSelector } from "@/components/admin/AdminOrgSelector";
import { Plus, Search, Trash2, Edit, Bell, Calendar, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SendReminderDialog } from "@/components/admin/SendReminderDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

const statusColors: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  "in-progress": "bg-info/10 text-info",
  review: "bg-warning/10 text-warning",
  done: "bg-success/10 text-success",
};

const statusDot: Record<string, string> = {
  todo: "bg-muted-foreground",
  "in-progress": "bg-info",
  review: "bg-warning",
  done: "bg-success",
};

export default function AdminTasksPage() {
  const { user } = useAuthStore();
  const { selectedOrgId } = useAdminStore();
  const orgId = selectedOrgId || user?.organizationId;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [assignDialogTask, setAssignDialogTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([api.getTasks(user.id, orgId), api.getMembers(orgId)]).then(([t, m]) => {
      setTasks(t); setMembers(m); setLoading(false);
    });
  }, [user, orgId]);

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (assigneeFilter === "unassigned" && t.assigneeId) return false;
    if (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && t.assigneeId !== assigneeFilter) return false;
    return true;
  });

  const handleCreate = async (data: Partial<Task>) => {
    if (!user) return;
    const task = await api.createTask({
      title: data.title || "Untitled",
      description: data.description,
      status: "todo",
      priority: data.priority || "medium",
      assigneeId: undefined,
      creatorId: user.id,
      organizationId: orgId,
      dueDate: data.dueDate,
      tags: data.tags || [],
    });
    setTasks((prev) => [...prev, task]);
    toast.success("Task created");
  };

  const handleUpdate = async (data: Partial<Task>) => {
    if (!editTask) return;
    const updated = await api.updateTask(editTask.id, data);
    setTasks((prev) => prev.map((t) => (t.id === editTask.id ? updated : t)));
    toast.success("Task updated");
  };

  const handleDelete = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted");
  };

  const handleAssign = async (taskId: string, assigneeId: string) => {
    const updated = await api.updateTask(taskId, { assigneeId: assigneeId || undefined });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    setAssignDialogTask(null);
    toast.success("Task assigned");
  };

  const handleSendReminder = async (taskId: string, recipientId: string, message: string) => {
    if (!orgId) return;
    await api.sendReminder(taskId, user!.id, recipientId, message, orgId);
    toast.success("Reminder sent!");
  };

  const getMemberName = (id?: string) => members.find((m) => m.id === id)?.name;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">Tasks</h1>
            <AdminOrgSelector />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setReminderOpen(true)}>
              <Bell className="w-4 h-4 mr-2" /> Remind
            </Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={() => { setEditTask(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Assignee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Task Cards Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              No tasks found. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((task) => (
              <Card key={task.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot[task.status]}`} />
                      <h3 className="font-medium text-sm truncate">{task.title}</h3>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTask(task); setFormOpen(true); }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[task.status]}`}>{task.status}</Badge>
                    <Badge variant="secondary" className={`text-[10px] ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    {task.assigneeId ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                            {getMemberName(task.assigneeId)?.split(" ").map(n => n[0]).join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{getMemberName(task.assigneeId)}</span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-muted-foreground hover:text-primary px-1"
                        onClick={() => setAssignDialogTask(task)}
                      >
                        <UserPlus className="w-3 h-3 mr-1" /> Assign
                      </Button>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Assign Dialog */}
        <Dialog open={!!assignDialogTask} onOpenChange={(o) => !o && setAssignDialogTask(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Assign Task</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-3">
              Assign "<span className="font-medium text-foreground">{assignDialogTask?.title}</span>" to a member:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.map((m) => (
                <button
                  key={m.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  onClick={() => assignDialogTask && handleAssign(assignDialogTask.id, m.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {m.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <TaskFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={editTask ? handleUpdate : handleCreate}
          task={editTask}
          organizationId={orgId}
          users={members}
          showAssignee={true}
        />
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
