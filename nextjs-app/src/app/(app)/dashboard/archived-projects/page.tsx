'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useQueryClient } from '@tanstack/react-query'; // May be needed later
import { useAuth } from '@/providers/auth-provider';
import { useAccountProjects, useRestoreProject, useDeleteProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Search, ArchiveRestore, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function ArchivedProjectsPage() {
  const router = useRouter();
  // const queryClient = useQueryClient(); // Unused but may be needed for future functionality
  const { currentAccount } = useAuth();
  const { data: projects, isLoading } = useAccountProjects(currentAccount?.id);
  const { mutate: restoreProject } = useRestoreProject();
  const { mutate: deleteProject } = useDeleteProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; project?: { id: string; name: string } }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project?: { id: string; name: string } }>({ open: false });

  // Filter for archived projects only
  const archivedProjects = projects?.filter(p => p.archived_at) || [];

  // Apply search filter
  const filteredProjects = archivedProjects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleRestore = (project: { id: string; name: string }) => {
    setRestoreDialog({ open: true, project });
  };

  const handleDelete = (project: { id: string; name: string }) => {
    setDeleteDialog({ open: true, project });
  };

  const confirmRestore = () => {
    if (restoreDialog.project) {
      restoreProject(restoreDialog.project.id, {
        onSuccess: () => {
          setRestoreDialog({ open: false });
        },
      });
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.project) {
      deleteProject(deleteDialog.project.id, {
        onSuccess: () => {
          setDeleteDialog({ open: false });
        },
      });
    }
  };

  if (!currentAccount) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No account selected</h1>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Archived Projects</h2>
          <p className="text-muted-foreground">
            Manage archived projects for {currentAccount.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search archived projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Archived Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading archived projects...
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  {searchQuery ? 'No archived projects match your search' : 'No archived projects'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {project.name}
                  </TableCell>
                  <TableCell>
                    {project.archived_at && format(new Date(project.archived_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Archived</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(project)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(project)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialog.open} onOpenChange={(open) => setRestoreDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{restoreDialog.project?.name}"? 
              This will make the project active again and it will appear in your project list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-green-600 hover:bg-green-700">
              Restore Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Project Permanently
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to permanently delete "{deleteDialog.project?.name}"?
            </AlertDialogDescription>
            <div className="space-y-2 text-sm text-muted-foreground mt-2">
              <p className="text-destructive font-medium">
                This action cannot be undone. You will permanently lose:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>All pages and content</li>
                <li>Custom domain configurations</li>
                <li>Theme settings and customizations</li>
                <li>All project data and history</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}