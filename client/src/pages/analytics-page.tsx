import { useAuth } from "@/hooks/use-auth";
import { useAnalytics } from "@/hooks/use-analytics";
import { Sidebar } from "@/components/layout-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useAnalytics();

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">Only administrators can view system analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">System-wide performance metrics and insights.</p>
        </header>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Task Status Distribution */}
            <Card className="shadow-lg border-border/60">
              <CardHeader>
                <CardTitle className="font-display">Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.tasksByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics?.tasksByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card className="shadow-lg border-border/60">
              <CardHeader>
                <CardTitle className="font-display">Project Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.projectsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card className="col-span-1 lg:col-span-2 shadow-lg border-border/60">
              <CardHeader>
                <CardTitle className="font-display">Team Performance (Tasks Resolved vs Open)</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.tasksByUser}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Legend />
                    <Bar dataKey="resolved" name="Resolved Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="open" name="Open Tasks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
