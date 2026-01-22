import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { Sidebar } from "@/components/layout-sidebar";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FolderKanban, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Filter projects for moderators (only show managed ones)
  const displayProjects = user?.role === "moderator" 
    ? projects?.filter(p => p.managerId === user.id)
    : projects;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage and track all ongoing initiatives.</p>
          </div>
          {(user?.role === "admin" || user?.role === "moderator") && (
            <CreateProjectDialog />
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayProjects?.map((project) => (
            <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 border-border/60">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <Badge variant={project.isActive ? "default" : "secondary"}>
                    {project.isActive ? "Active" : "Archived"}
                  </Badge>
                </div>
                <CardTitle className="font-display text-xl line-clamp-1 group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                  {project.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">M</AvatarFallback>
                    </Avatar>
                    <span>Manager ID: {project.managerId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{project.createdAt ? format(new Date(project.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-2">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" className="w-full group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {displayProjects?.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl">
              <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold">No Projects Found</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-2">
                Get started by creating a new project to track your team's progress.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
