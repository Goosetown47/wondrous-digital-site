/**
 * AddButton Component
 *
 * Generic "+ Add" button for adding items to arrays
 */

'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export interface AddButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Button text (default: "Add Item") */
  text?: string;
  /** Optional className for styling */
  className?: string;
}

export function AddButton({ onClick, text = 'Add Item', className }: AddButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={className}
      type="button"
    >
      <Plus className="w-4 h-4 mr-2" />
      {text}
    </Button>
  );
}
