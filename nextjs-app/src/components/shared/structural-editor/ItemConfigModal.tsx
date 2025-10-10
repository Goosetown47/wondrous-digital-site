/**
 * ItemConfigModal Component
 *
 * Generic modal wrapper for configuring array items
 */

'use client';

import { ReactNode, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ItemConfigModalProps<T> {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Save handler */
  onSave: (item: T) => void;
  /** Item being edited (null when creating new) */
  item: T | null;
  /** Modal title */
  title: string;
  /** Optional description */
  description?: string;
  /** Custom editor component (rendered as children) */
  children: ReactNode;
}

export function ItemConfigModal<T>({
  isOpen,
  onClose,
  title,
  description,
  children,
}: ItemConfigModalProps<T>) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Custom editor component */}
        <div className="py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
