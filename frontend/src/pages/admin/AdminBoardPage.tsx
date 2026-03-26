import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { useAdminStore } from "@/store/admin-store";
import { api } from "@/lib/api";
import { Task, TaskStatus, User } from "@/types";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { AdminOrgSelector } from "@/components/admin/AdminOrgSelector";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminBoardPage() {
  const { user } = useAuthStore();
  const { selectedOrgId } = useAdminStore();
  const location = useLocation();
  const navigate = useNavigate();
  const orgId = selectedOrgId || user?.organizationId;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const openTaskId = (location.state as { openTaskId?: string })?.openTaskId;

  useEffect(() => {
    if (!user) return;
    if (!orgId) {
      setTasks([]);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([api.getTasks(user.id, orgId), api.getMembers(orgId)]).then(([t, m]) => {
      setTasks(t);
      setMembers(m);
      setLoading(false);
    });
  }, [user, orgId]);

  useEffect(() => {
    if (openTaskId && tasks.length > 0) {
      const task = tasks.find((t) => t.id === openTaskId);
      if (task) {
        setEditTask(task);
        setFormOpen(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [openTaskId, tasks]);

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    const prevTasks = tasks;
    setTasks((p) => p.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await api.moveTask(taskId, newStatus);
      toast.success("Task moved");
    } catch {
      setTasks(prevTasks);
      toast.error("Cannot change status once task is done");
    }
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    if (!user) return;
    const task = await api.createTask({
      title: data.title || "Untitled",
      description: data.description,
      status: "todo",
      priority: data.priority || "medium",
      assigneeId: undefined,
      creatorId: user.id,
      organizationId: orgId ?? undefined,
      dueDate: data.dueDate,
      tags: data.tags || [],
    });
    setTasks((prev) => [...prev, task]);
    toast.success("Task created");
  };

  const handleUpdateTask = async (data: Partial<Task>) => {
    if (!editTask) return;
    const updated = await api.updateTask(editTask.id, data);
    setTasks((prev) => prev.map((t) => (t.id === editTask.id ? updated : t)));
    toast.success("Task updated");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">Task Board</h1>
            <AdminOrgSelector />
          </div>
          <Button className="gradient-primary text-primary-foreground border-0" onClick={() => { setEditTask(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <KanbanBoard tasks={tasks} onMoveTask={handleMoveTask} onTaskClick={(t) => { setEditTask(t); setFormOpen(true); }} users={members} />
        )}

        <TaskFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={editTask ? handleUpdateTask : handleCreateTask}
          task={editTask}
          organizationId={orgId ?? undefined}
          users={members}
        />
      </div>
    </DashboardLayout>
  );
}
