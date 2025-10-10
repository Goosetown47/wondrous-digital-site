/**
 * ItemControls Component
 *
 * Edit/Delete controls for array items
 * Uses AppButton to ensure consistent app UI styling regardless of theme
 */

'use client';

import { AppButton } from '@/components/ui/app-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

export interface ItemControlsProps {
  /** Edit button click handler */
  onEdit: () => void;
  /** Delete button click handler */
  onDelete: () => void;
  /** Whether to show confirmation dialog for delete (default: true) */
  confirmDelete?: boolean;
  /** Optional className for styling */
  className?: string;
}

export function ItemControls({
  onEdit,
  onDelete,
  confirmDelete = true,
  className,
}: ItemControlsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      {/* Edit Button */}
      <AppButton
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-8 w-8 p-0"
        type="button"
        title="Edit item"
      >
        <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </AppButton>

      {/* Delete Button with Confirmation */}
      {confirmDelete ? (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <AppButton
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              type="button"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </AppButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AppButton
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0"
          type="button"
          title="Delete item"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </AppButton>
      )}
    </div>
  );
}
