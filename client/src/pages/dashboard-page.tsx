import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout-sidebar";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects } = useProjects();
  const { data: tasks } = useTasks();

  if (!user) return null;

  // Simple stats calculation
  const totalProjects = projects?.length || 0;
  const myTasks = tasks?.filter(t => t.assignedToId === user.id) || [];
  const pendingTasks = myTasks.filter(t => t.status === "open" || t.status === "in_progress").length;
  const resolvedTasks = myTasks.filter(t => t.status === "resolved" || t.status === "closed").length;

  const stats = [
    { 
      label: "Active Projects", 
      value: totalProjects, 
      icon: Briefcase, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Pending Tasks", 
      value: pendingTasks, 
      icon: Clock, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10" 
    },
    { 
      label: "Resolved", 
      value: resolvedTasks, 
      icon: CheckCircle2, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10" 
    },
  ];

  const recentTasks = myTasks.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Hello, {user.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening today.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-3xl font-bold mt-1 font-display">{stat.value}</h3>
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
          {/* Recent Tasks */}
          <Card className="col-span-1 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">My Recent Tasks</CardTitle>
              <Badge variant="secondary" className="font-normal">
                {myTasks.length} Total
              </Badge>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-start justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{task.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description || "No description"}</p>
                      </div>
                      <Badge 
                        variant={task.status === "open" ? "destructive" : task.status === "resolved" ? "default" : "secondary"}
                        className="ml-2 capitalize"
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>All caught up! No tasks assigned.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions / Info Card */}
          <Card className="col-span-1 bg-gradient-to-br from-primary to-accent text-primary-foreground border-none shadow-xl">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                System Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                <h4 className="font-bold flex items-center gap-2">
                  New Features Available
                  <ArrowUpRight className="w-4 h-4" />
                </h4>
                <p className="text-sm opacity-90 mt-1">
                  We've updated the analytics dashboard with new real-time metrics for project completion rates.
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                <h4 className="font-bold">Maintenance Schedule</h4>
                <p className="text-sm opacity-90 mt-1">
                  Scheduled maintenance will occur this Sunday at 2:00 AM UTC.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
