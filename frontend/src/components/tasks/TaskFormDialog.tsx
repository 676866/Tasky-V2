import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskPriority, TaskStatus, User } from "@/types";
import { Loader2 } from "lucide-react";

function toDateInputValue(d: string | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().slice(0, 10);
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  task?: Task | null;
  organizationId?: string;
  users?: User[];
  /** When false, hide assignee field (e.g. for regular users creating their own task) */
  showAssignee?: boolean;
}

export function TaskFormDialog({ open, onOpenChange, onSubmit, task, organizationId, users = [], showAssignee = true }: TaskFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TaskStatus>(task?.status || "todo");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "medium");
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || "");
  const UNASSIGNED_ASSIGNEE_VALUE = "__unassigned__";
  const isEditing = !!task;
  const isDone = task?.status === "done";
  const readOnly = isDone; // When done, all inputs are disabled
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    const title = task?.title ?? "";
    const description = task?.description ?? "";
    const dueDate = toDateInputValue(task?.dueDate);
    reset({ title, description, dueDate });
    setStatus((task?.status as TaskStatus) || "todo");
    setPriority((task?.priority as TaskPriority) || "medium");
    setAssigneeId(task?.assigneeId ?? "");
  }, [open, task, reset]);

  const onFormSubmit = async (data: { title: string; description: string; dueDate: string }) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        status,
        priority,
        assigneeId: assigneeId || undefined,
        organizationId,
        tags: [],
      });
      reset();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...register("title", { required: true })} placeholder="Task title" disabled={readOnly} className={readOnly ? "bg-muted" : ""} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register("description")} placeholder="Optional description" rows={3} disabled={readOnly} className={readOnly ? "bg-muted" : ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              {isEditing ? (
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as TaskStatus)}
                  disabled={readOnly}
                >
                  <SelectTrigger className={readOnly ? "bg-muted" : ""}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value="To Do" disabled className="bg-muted" />
              )}
              {isDone && <p className="text-xs text-muted-foreground">Task is done. No edits allowed.</p>}
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)} disabled={readOnly}>
                <SelectTrigger className={readOnly ? "bg-muted" : ""}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className={`grid gap-3 ${showAssignee && isEditing ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" min={todayDateString()} {...register("dueDate")} disabled={readOnly} className={readOnly ? "bg-muted" : ""} />
            </div>
            {showAssignee && isEditing && (
              <div className="space-y-2">
                <Label>Assign to</Label>
                <Select
                  value={assigneeId || UNASSIGNED_ASSIGNEE_VALUE}
                  onValueChange={(v) => setAssigneeId(v === UNASSIGNED_ASSIGNEE_VALUE ? "" : v)}
                  disabled={readOnly}
                >
                  <SelectTrigger className={readOnly ? "bg-muted" : ""}><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_ASSIGNEE_VALUE}>Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {!isEditing && showAssignee && (
            <p className="text-xs text-muted-foreground">💡 You can assign this task to a member after creation.</p>
          )}
          {!readOnly && (
            <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Update Task" : "Create Task"}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
