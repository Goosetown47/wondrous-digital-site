'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjects, useArchiveProject, useDeleteProject } from '@/hooks/useProjects';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Plus, Search, MoreHorizontal, Edit, Copy, Archive, Trash2, Shield } from 'lucide-react';
import type { ProjectWithAccount } from '@/lib/services/projects';
import { AccountSelector } from '@/components/projects/AccountSelector';
import { ProjectAccessModal } from '@/components/projects/ProjectAccessModal';
import { useIsAccountOwner } from '@/hooks/useRole';

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects, isLoading } = useProjects(true); // Include archived
  const { mutate: archiveProject } = useArchiveProject();
  const { mutate: deleteProject } = useDeleteProject();
  const { data: isAccountOwner } = useIsAccountOwner();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project?: ProjectWithAccount }>({ open: false });
  const [archiveDialog, setArchiveDialog] = useState<{ open: boolean; project?: ProjectWithAccount }>({ open: false });
  const [accessModalState, setAccessModalState] = useState<{ open: boolean; project?: ProjectWithAccount }>({ open: false });

  // Filter projects based on search and status
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = !searchQuery || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.accounts?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !project.archived_at) ||
      (statusFilter === 'archived' && project.archived_at);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleArchive = (project: ProjectWithAccount) => {
    setArchiveDialog({ open: true, project });
  };

  const handleDelete = (project: ProjectWithAccount) => {
    setDeleteDialog({ open: true, project });
  };

  const confirmArchive = () => {
    if (archiveDialog.project) {
      archiveProject(archiveDialog.project.id);
      setArchiveDialog({ open: false });
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.project) {
      deleteProject(deleteDialog.project.id);
      setDeleteDialog({ open: false });
    }
  };

  return (
    <PermissionGate permission="projects:read">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <Button onClick={() => router.push('/tools/projects/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects or accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('archived')}
            >
              Archived
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading projects...
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/tools/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <AccountSelector
                        projectId={project.id}
                        currentAccount={project.accounts}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {project.slug || 'No domain'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {project.archived_at ? (
                        <Badge variant="secondary">Archived</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(project.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => router.push(`/tools/projects/${project.id}`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/tools/projects/new?template=${project.id}`)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Clone
                          </DropdownMenuItem>
                          {isAccountOwner && (
                            <DropdownMenuItem
                              onClick={() => setAccessModalState({ open: true, project })}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Manage Access
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {!project.archived_at && (
                            <DropdownMenuItem
                              onClick={() => handleArchive(project)}
                              className="text-orange-600"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(project)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={archiveDialog.open} onOpenChange={(open) => setArchiveDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive "{archiveDialog.project?.name}"? 
                This will hide the project from active views but can be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmArchive} className="bg-orange-600">
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete "{deleteDialog.project?.name}"? 
                This action cannot be undone and will remove all project data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Project Access Modal */}
        {accessModalState.project && accessModalState.project.account_id && (
          <ProjectAccessModal
            projectId={accessModalState.project.id}
            projectName={accessModalState.project.name}
            accountId={accessModalState.project.account_id}
            open={accessModalState.open}
            onOpenChange={(open) => setAccessModalState({ open })}
          />
        )}
      </div>
    </PermissionGate>
  );
}