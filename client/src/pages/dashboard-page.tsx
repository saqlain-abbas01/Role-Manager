import { useAuth } from "@/hooks/use-auth";
import {
  useDashboardStats,
  useDashboardProjects,
  useDashboardTasks,
} from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout-sidebar";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Users,
  ListTodo,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useDashboardProjects();
  const { data: tasks, isLoading: tasksLoading } = useDashboardTasks();

  console.log("Dashboard stats:", stats);

  if (!user) return null;

  const isAdmin = user.role === ROLES.ADMIN;
  const isModerator = user.role === ROLES.MODERATOR;
  const isUser = user.role === ROLES.USER;

  // Build stats based on role
  let statsList: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
  }[] = [];

  if (isAdmin && stats) {
    statsList = [
      {
        label: "Total Projects",
        value: stats.totalProjects,
        icon: Briefcase,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        label: "Total Tasks",
        value: stats.totalTasks,
        icon: ListTodo,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
      {
        label: "Pending Tasks",
        value: stats.pendingTasks,
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      {
        label: "Completed Tasks",
        value: stats.completedTasks,
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        label: "Active Users",
        value: stats.activeUsers,
        icon: Users,
        color: "text-cyan-500",
        bg: "bg-cyan-500/10",
      },
    ];
  } else if (isModerator && stats) {
    statsList = [
      {
        label: "My Projects",
        value: stats.myProjects,
        icon: Briefcase,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        label: "Active Projects",
        value: stats.activeProjects,
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        label: "My Tasks",
        value: stats.myTasks,
        icon: ListTodo,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
      {
        label: "Pending Tasks",
        value: stats.pendingTasks,
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      {
        label: "Completed Tasks",
        value: stats.completedTasks,
        icon: CheckCircle2,
        color: "text-cyan-500",
        bg: "bg-cyan-500/10",
      },
    ];
  } else if (isUser && stats) {
    statsList = [
      {
        label: "Assigned Tasks",
        value: stats.assignedTasks,
        icon: ListTodo,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        label: "In Progress",
        value: stats.inProgressTasks,
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      {
        label: "Completed",
        value: stats.completedTasks,
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
    ];
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Hello, {user.fullName.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1 capitalize">
            Welcome to your {user.role} dashboard
          </p>
        </header>

        {statsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {statsError instanceof Error
                ? statsError.message
                : "Failed to load dashboard data"}
            </AlertDescription>
          </Alert>
        )}

        {statsLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div
              className={`grid gap-6 mb-8 ${isAdmin ? "grid-cols-1 md:grid-cols-5" : isModerator ? "grid-cols-1 md:grid-cols-5" : "grid-cols-1 md:grid-cols-3"}`}
            >
              {statsList.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <h3 className="text-3xl font-bold mt-1 font-display">
                          {stat.value}
                        </h3>
                      </div>
                      <div className={`p-4 rounded-xl ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Projects Section */}
              {(isAdmin || isModerator) && (
                <Card className="col-span-1 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-display">
                      {isAdmin ? "All Projects" : "My Projects"}
                    </CardTitle>
                    <Badge variant="secondary" className="font-normal">
                      {projects?.length || 0} Total
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {projectsLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : projects && projects.length > 0 ? (
                      <div className="space-y-4">
                        {projects.slice(0, 5).map((project: any) => (
                          <div
                            key={project._id}
                            className="flex items-start justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                          >
                            <div>
                              <h4 className="font-medium text-foreground">
                                {project.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {project.description || "No description"}
                              </p>
                            </div>
                            <Badge
                              variant={project.isActive ? "default" : "outline"}
                              className="ml-2"
                            >
                              {project.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>No projects yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tasks Section */}
              <Card
                className={`${isAdmin || isModerator ? "col-span-1" : "col-span-1 lg:col-span-2"} shadow-sm`}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display">
                    {isAdmin
                      ? "All Tasks"
                      : isModerator
                        ? "My Tasks"
                        : "My Tasks"}
                  </CardTitle>
                  <Badge variant="secondary" className="font-normal">
                    {tasks?.length || 0} Total
                  </Badge>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : tasks && tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasks.slice(0, 5).map((task: any) => (
                        <div
                          key={task._id}
                          className="flex items-start justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {task.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {task.description || "No description"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              task.status === "open"
                                ? "destructive"
                                : task.status === "resolved"
                                  ? "default"
                                  : task.status === "closed"
                                    ? "secondary"
                                    : "outline"
                            }
                            className="ml-2 capitalize"
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p>
                        {isAdmin
                          ? "No tasks in the system"
                          : isModerator
                            ? "No tasks created yet"
                            : "All caught up! No tasks assigned."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Updates - Admin only */}
              {isAdmin && (
                <Card className="col-span-2 bg-gradient-to-br from-primary to-accent text-primary-foreground border-none shadow-xl">
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      System Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                      <h4 className="font-bold flex items-center gap-2">
                        System Status
                        <ArrowUpRight className="w-4 h-4" />
                      </h4>
                      <p className="text-sm opacity-90 mt-1">
                        All systems operating normally with full capacity.
                      </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                      <h4 className="font-bold">Admin Insights</h4>
                      <p className="text-sm opacity-90 mt-1">
                        {statsList[0]?.value} projects across {projects?.length}{" "}
                        with{" "}
                        {tasks?.filter((t: any) => t.status === "in_progress")
                          .length || 0}{" "}
                        tasks in progress.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
