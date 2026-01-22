import { useRoute } from "wouter";
import { useProject } from "@/hooks/use-projects";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/layout-sidebar";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CheckCircle2, Circle, Clock, MessageSquare, AlertCircle } from "lucide-react";

export default function ProjectDetailsPage() {
  const [, params] = useRoute("/projects/:id");
  const projectId = parseInt(params?.id || "0");
  const { data: project, isLoading: loadingProject } = useProject(projectId);
  const { data: tasks, isLoading: loadingTasks } = useTasks();
  const { user } = useAuth();
  
  const updateTask = useUpdateTask();
  const [resolveNote, setResolveNote] = useState("");
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  if (loadingProject || loadingTasks) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const projectTasks = tasks?.filter(t => t.projectId === projectId) || [];

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTask.mutate({ id: taskId, status: newStatus });
  };

  const handleResolve = (taskId: number) => {
    updateTask.mutate({ 
      id: taskId, 
      status: "resolved", 
      resolutionNotes: resolveNote 
    }, {
      onSuccess: () => {
        setResolveNote("");
        setSelectedTask(null);
      }
    });
  };

  const isManager = user?.id === project.managerId || user?.role === "admin";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold text-foreground">{project.name}</h1>
                <Badge variant={project.isActive ? "default" : "secondary"}>
                  {project.isActive ? "Active" : "Archived"}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">{project.description}</p>
            </div>
            {isManager && <CreateTaskDialog projectId={projectId} />}
          </div>
        </header>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-lg">{task.title}</h4>
                        <Badge variant={
                          task.status === 'open' ? 'destructive' : 
                          task.status === 'in_progress' ? 'secondary' : 
                          'outline'
                        } className="capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      {task.resolutionNotes && (
                        <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground flex gap-2">
                          <MessageSquare className="w-3 h-3 mt-0.5" />
                          <span>Resolution Note: {task.resolutionNotes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Actions based on role and status */}
                      
                      {/* Assignee can mark In Progress */}
                      {task.status === 'open' && (user?.id === task.assignedToId || isManager) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                        >
                          <Clock className="w-4 h-4 mr-2" /> Start Working
                        </Button>
                      )}

                      {/* Assignee can Resolve */}
                      {task.status === 'in_progress' && (user?.id === task.assignedToId || isManager) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedTask(task.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Resolve
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
                                onChange={(e) => setResolveNote(e.target.value)}
                              />
                              <Button onClick={() => handleResolve(task.id)} className="w-full">
                                Submit Resolution
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Manager can Verify & Close */}
                      {task.status === 'resolved' && isManager && (
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusChange(task.id, "closed")}
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" /> Verify & Close
                        </Button>
                      )}

                      {task.status === 'closed' && (
                        <div className="flex items-center text-green-600 text-sm font-medium px-3 py-1 bg-green-50 rounded-full">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Verified
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {projectTasks.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Circle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No tasks yet. Create one to get started!</p>
                  </div>
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
