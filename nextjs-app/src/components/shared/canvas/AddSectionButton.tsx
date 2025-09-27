'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddSectionButtonProps {
  onClick: () => void;
  isVisible?: boolean;
}

export function AddSectionButton({ onClick, isVisible = true }: AddSectionButtonProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative h-12 flex items-center justify-center group"
    >
      {/* Horizontal line with button in center */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-dashed border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />
      </div>

      <Button
        size="sm"
        variant="outline"
        className="relative bg-background hover:bg-accent hover:scale-105 transition-all shadow-sm"
        onClick={onClick}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Section
      </Button>
    </motion.div>
  );
}