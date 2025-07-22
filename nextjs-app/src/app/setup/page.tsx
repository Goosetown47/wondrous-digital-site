'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, ExternalLink } from 'lucide-react';

export default function SetupPage() {
  const [projectName, setProjectName] = useState('');
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();

  const handleCreateProject = () => {
    if (projectName.trim()) {
      createProject.mutate(projectName, {
        onSuccess: () => {
          setProjectName('');
        },
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Project Setup</h1>

        {/* Create new project */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Website"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCreateProject}
                disabled={!projectName.trim() || createProject.isPending}
              >
                {createProject.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create
              </Button>
            </div>
          </div>
          {createProject.isError && (
            <p className="text-sm text-red-600 mt-2">
              Error creating project. Please try again.
            </p>
          )}
        </Card>

        {/* Existing projects */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/builder/${project.id}`}>
                        Edit
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/sites/${project.id}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No projects yet. Create your first one above!
            </p>
          )}
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}