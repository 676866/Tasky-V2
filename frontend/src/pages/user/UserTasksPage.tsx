import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Button } from "@/components/ui/button";
import { Plus, Search, Calendar, Edit, Trash2, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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

export default function UserTasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getTasks(user.id),
      user.organizationId ? api.getTasks(user.id, user.organizationId) : Promise.resolve([]),
    ]).then(([personal, orgTasks]) => {
      const merged = [...personal, ...orgTasks.filter((ot) => !personal.some((p) => p.id === ot.id))];
      setTasks(merged);
      setLoading(false);
    });
  }, [user]);

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const handleCreate = async (data: Partial<Task>) => {
    if (!user) return;
    const task = await api.createTask({
      title: data.title || "Untitled",
      description: data.description,
      status: "todo",
      priority: data.priority || "medium",
      assigneeId: user.id,
      creatorId: user.id,
      organizationId: undefined,
      dueDate: data.dueDate,
      tags: [],
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

  const handleMarkDone = async (task: Task) => {
    const updated = await api.updateTask(task.id, { status: "done" });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    toast.success("Task marked as done!");
  };

  const handleDelete = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted");
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">My Tasks</h1>
          <Button className="gradient-primary text-primary-foreground border-0" onClick={() => { setEditTask(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              No tasks found. Create one!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((task) => {
              const isCreatedByUser = task.creatorId === user?.id;
              return (
              <Card key={task.id} className={`group hover:shadow-md transition-shadow ${task.status === "done" ? "opacity-70" : ""}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot[task.status]}`} />
                      <h3 className="font-medium text-sm truncate">{task.title}</h3>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {task.status !== "done" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => handleMarkDone(task)}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {isCreatedByUser && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTask(task); setFormOpen(true); }}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(task.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[task.status]}`}>{task.status}</Badge>
                    <Badge variant="secondary" className={`text-[10px] ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                    {task.organizationId && (
                      <Badge variant="outline" className="text-[10px]">Org</Badge>
                    )}
                  </div>

                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}

        <TaskFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={editTask ? handleUpdate : handleCreate}
          task={editTask}
          showAssignee={false}
        />
      </div>
    </DashboardLayout>
  );
}
