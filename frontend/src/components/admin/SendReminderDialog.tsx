import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, User } from "@/types";
import { Loader2, Bell } from "lucide-react";

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskId: string, recipientId: string, message: string) => Promise<void>;
  tasks: Task[];
  members: User[];
}

export function SendReminderDialog({ open, onOpenChange, onSubmit, tasks, members }: SendReminderDialogProps) {
  const [taskId, setTaskId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !recipientId || !message.trim()) return;
    setLoading(true);
    try {
      await onSubmit(taskId, recipientId, message);
      setTaskId("");
      setRecipientId("");
      setMessage("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Send Reminder
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Task</Label>
            <Select value={taskId} onValueChange={setTaskId}>
              <SelectTrigger><SelectValue placeholder="Select a task" /></SelectTrigger>
              <SelectContent>
                {tasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger><SelectValue placeholder="Select a member" /></SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Don't forget to complete this task..." rows={3} />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={loading || !taskId || !recipientId || !message.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send Reminder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
