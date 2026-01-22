import { useAuth } from "@/hooks/use-auth";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/layout-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CheckCircle2, Clock, CheckSquare, Trash2 } from "lucide-react";

export default function TasksPage() {
  const { user } = useAuth();
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();

  const [resolveNote, setResolveNote] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  if (isLoading) return <div>Loading...</div>;

  // Show only tasks assigned to current user
  const myTasks = tasks?.filter((t) => t.assignedToId === user?.id) || [];

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask.mutate({ id: taskId, status: newStatus });
  };

  const handleResolve = (taskId: string) => {
    updateTask.mutate(
      {
        id: taskId,
        status: "resolved",
        resolutionNotes: resolveNote,
      },
      {
        onSuccess: () => {
          setResolveNote("");
          setSelectedTask(null);
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            My Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Keep track of your assigned work.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Assigned to Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-lg">{task.title}</h4>
                      <Badge
                        variant={
                          task.status === "open"
                            ? "destructive"
                            : task.status === "in_progress"
                              ? "secondary"
                              : "default"
                        }
                        className="capitalize"
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {task.status === "open" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(task.id as string, "in_progress")
                        }
                      >
                        <Clock className="w-4 h-4 mr-2" /> Start
                      </Button>
                    )}

                    {task.status === "in_progress" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedTask(task.id as string)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Resolve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Task</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <Textarea
                              placeholder="Describe your solution..."
                              value={resolveNote}
                              onChange={(e) => setResolveNote(e.target.value)}
                            />
                            <Button
                              onClick={() => handleResolve(task.id as string)}
                              className="w-full"
                            >
                              Mark Resolved
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {task.status === "resolved" && (
                      <span className="text-sm text-muted-foreground italic px-3">
                        Pending Verification
                      </span>
                    )}

                    {task.status === "closed" && (
                      <div className="flex items-center text-green-600 text-sm font-medium px-3">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Verified
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {myTasks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                  <p>You have no assigned tasks. Great job!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
