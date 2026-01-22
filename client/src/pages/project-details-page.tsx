import { useRoute, useLocation } from "wouter";
import { useProject } from "@/hooks/use-projects";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/layout-sidebar";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function ProjectDetailsPage() {
  const [, params] = useRoute("/projects/:id");
  const [, setLocation] = useLocation();
  const projectId = params?.id;

  if (!projectId) return <div>Invalid project ID</div>;

  const {
    data: project,
    isLoading: loadingProject,
    error: projectError,
  } = useProject(projectId);
  const {
    data: tasks,
    isLoading: loadingTasks,
    error: tasksError,
  } = useTasks();
  const { user } = useAuth();
  const updateTask = useUpdateTask();

  const [resolveNote, setResolveNote] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Handle loading state
  if (loadingProject || loadingTasks) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Handle errors
  if (projectError || tasksError) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/projects")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {projectError
                ? "Failed to load project details"
                : "Failed to load tasks"}
              . Please try again later.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/projects")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Project not found.</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const projectTasks = tasks?.filter((t) => t.projectId === projectId) || [];

  // Filter tasks based on user role
  let visibleTasks = projectTasks;
  if (user?.role === "user") {
    // Users only see their assigned tasks
    visibleTasks = projectTasks.filter(
      (t) => t.assignedToId === user._id?.toString(),
    );
  }

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask.mutate(
      { id: taskId, status: newStatus },
      {
        onError: () => {
          // Error is handled by the toast in the hook
        },
      },
    );
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

  const isManager =
    user?._id?.toString() === project.managerId || user?.role === "admin";
  const isUser = user?.role === "user";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold text-foreground">
                  {project.name}
                </h1>
                <Badge variant={project.isActive ? "default" : "secondary"}>
                  {project.isActive ? "Active" : "Archived"}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {project.description}
              </p>
            </div>
            {isManager && <CreateTaskDialog projectId={projectId} />}
          </div>
        </header>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">
                {isUser ? "Your Tasks" : "Project Tasks"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visibleTasks.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Circle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>
                      {isUser
                        ? "No tasks assigned to you yet."
                        : "No tasks yet. Create one to get started!"}
                    </p>
                  </div>
                ) : (
                  visibleTasks.map((task) => (
                    <div
                      key={task._id?.toString()}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-lg">
                            {task.title}
                          </h4>
                          <Badge
                            variant={
                              task.status === "open"
                                ? "destructive"
                                : task.status === "in_progress"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="capitalize"
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                        {task.resolutionNotes && (
                          <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground flex gap-2">
                            <MessageSquare className="w-3 h-3 mt-0.5" />
                            <span>Resolution Note: {task.resolutionNotes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Users: Can update status and resolve */}
                        {isUser && (
                          <>
                            {/* User can mark In Progress */}
                            {task.status === "open" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusChange(
                                    task._id?.toString() as string,
                                    "in_progress",
                                  )
                                }
                                disabled={updateTask.isPending}
                              >
                                {updateTask.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Clock className="w-4 h-4 mr-2" />
                                )}
                                Start Working
                              </Button>
                            )}

                            {/* User can Resolve */}
                            {task.status === "in_progress" && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      setSelectedTask(
                                        task._id?.toString() as string,
                                      )
                                    }
                                    disabled={updateTask.isPending}
                                  >
                                    {updateTask.isPending ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                    )}
                                    Resolve
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Resolve Task</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <Textarea
                                      placeholder="How did you resolve this issue?"
                                      value={resolveNote}
                                      onChange={(e) =>
                                        setResolveNote(e.target.value)
                                      }
                                      disabled={updateTask.isPending}
                                    />
                                    <Button
                                      onClick={() =>
                                        handleResolve(
                                          task._id?.toString() as string,
                                        )
                                      }
                                      className="w-full"
                                      disabled={
                                        updateTask.isPending ||
                                        !resolveNote.trim()
                                      }
                                    >
                                      {updateTask.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      )}
                                      Submit Resolution
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}

                            {/* Show resolved/closed status */}
                            {task.status === "resolved" && (
                              <div className="flex items-center text-yellow-600 text-sm font-medium px-3 py-1 bg-yellow-50 rounded-full">
                                <Clock className="w-4 h-4 mr-1" /> Pending
                                Verification
                              </div>
                            )}

                            {task.status === "closed" && (
                              <div className="flex items-center text-green-600 text-sm font-medium px-3 py-1 bg-green-50 rounded-full">
                                <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                                Verified
                              </div>
                            )}
                          </>
                        )}

                        {/* Moderators: View only (can see progress) */}
                        {!isUser && !isManager && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
                            <Circle className="w-2 h-2" />
                            Tracking Progress
                          </div>
                        )}

                        {/* Manager: Can verify & close */}
                        {isManager && (
                          <>
                            {task.status === "resolved" && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  handleStatusChange(
                                    task._id?.toString() as string,
                                    "closed",
                                  )
                                }
                                disabled={updateTask.isPending}
                              >
                                {updateTask.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                )}
                                Verify & Close
                              </Button>
                            )}

                            {task.status === "closed" && (
                              <div className="flex items-center text-green-600 text-sm font-medium px-3 py-1 bg-green-50 rounded-full">
                                <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                                Verified
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
