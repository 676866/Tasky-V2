import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Task, TaskStatus, User } from "@/types";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function UserBoardPage() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const openTaskId = (location.state as { openTaskId?: string })?.openTaskId;

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getTasks(user.id),
      user.organizationId ? api.getTasks(user.id, user.organizationId) : Promise.resolve([]),
      user.organizationId ? api.getMembers(user.organizationId) : Promise.resolve([]),
    ]).then(([personal, orgTasks, m]) => {
      const merged = [...personal, ...orgTasks.filter((ot) => !personal.some((p) => p.id === ot.id))];
      setTasks(merged);
      setMembers(m);
      setLoading(false);
    });
  }, [user]);

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
      toast.success("Task updated");
    } catch {
      setTasks(prevTasks);
      toast.error("Cannot change status once task is done");
    }
  };

  const handleSubmit = async (data: Partial<Task>) => {
    if (!user) return;
    if (editTask) {
      const updated = await api.updateTask(editTask.id, data);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.success("Task updated");
      setEditTask(null);
    } else {
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
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">My Board</h1>
          <Button className="gradient-primary text-primary-foreground border-0" onClick={() => { setEditTask(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3"><Skeleton className="h-6 w-24" /><Skeleton className="h-24 w-full" /></div>
            ))}
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onMoveTask={handleMoveTask}
            onTaskClick={(t) => {
              // Only open edit form for tasks the user created; admin-assigned tasks are drag-and-drop only
              if (t.creatorId === user?.id) {
                setEditTask(t);
                setFormOpen(true);
              }
            }}
            users={members}
          />
        )}
        <TaskFormDialog open={formOpen} onOpenChange={(open) => { if (!open) setEditTask(null); setFormOpen(open); }} onSubmit={handleSubmit} task={editTask} users={members} showAssignee={false} />
      </div>
    </DashboardLayout>
  );
}
