import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, GripVertical } from "lucide-react";

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-muted-foreground" },
  { id: "in-progress", title: "In Progress", color: "bg-info" },
  { id: "review", title: "Review", color: "bg-warning" },
  { id: "done", title: "Done", color: "bg-success" },
];

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
  users?: User[];
}

export function KanbanBoard({ tasks, onMoveTask, onTaskClick, users = [] }: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as TaskStatus;
    onMoveTask(result.draggableId, newStatus);
  };

  const getColumnTasks = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {columns.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold">{col.title}</span>
                <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? "bg-primary/5 border-2 border-dashed border-primary/30" : "bg-muted/30"}`}
                  >
                    {colTasks.map((task, idx) => (
                      <Draggable key={task.id} draggableId={task.id} index={idx} isDragDisabled={task.status === "done"}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`rounded-lg border border-border bg-card p-3 cursor-pointer transition-shadow ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : "hover:shadow-md"}`}
                            onClick={() => onTaskClick?.(task)}
                          >
                            <div className="flex items-start gap-2">
                              <div {...provided.dragHandleProps} className="mt-0.5 text-muted-foreground">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                  </Badge>
                                  {task.dueDate && (
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                  )}
                                </div>
                                {task.assigneeId && (
                                  <div className="mt-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                        {users.find((u) => u.id === task.assigneeId)?.name?.split(" ").map((n) => n[0]).join("") || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
