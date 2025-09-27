'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Edit2, Type } from 'lucide-react';
import { TextEditorModal } from './TextEditorModal';

export type TextType = 'heading' | 'paragraph' | 'button' | 'link' | 'plain' | 'rich';

interface EditableTextProps {
  value: string;
  type?: TextType;
  className?: string;
  children?: React.ReactNode;
  onUpdate: (value: string) => void;
  editable?: boolean;
  placeholder?: string;
  maxLength?: number;
  richText?: boolean; // Enable rich text editing for this field
  projectId?: string | null; // Project ID for internal page linking
}

export function EditableText({
  value,
  type = 'plain',
  className,
  children,
  onUpdate,
  editable = false,
  placeholder = 'Click to edit text',
  maxLength,
  richText = false,
  projectId,
}: EditableTextProps) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!editable) return;

    // Prevent event bubbling to parent elements
    e.stopPropagation();
    e.preventDefault();

    setShowModal(true);
  }, [editable]);

  const handleUpdate = useCallback((newValue: string) => {
    onUpdate(newValue);
    setShowModal(false);
  }, [onUpdate]);

  // If not editable, just render the children or text
  if (!editable) {
    return children || <span className={className}>{value || placeholder}</span>;
  }

  return (
    <>
      <div
        className={cn(
          'relative inline-block cursor-pointer transition-all',
          'hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-primary/50',
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Render children if provided, otherwise render the text */}
        {children || <span>{value || placeholder}</span>}

        {/* Hover overlay indicator */}
        {isHovered && (
          <div className="absolute -top-8 left-0 z-50 flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs whitespace-nowrap pointer-events-none">
            {type === 'heading' ? <Type className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
            <span>Click to edit</span>
          </div>
        )}
      </div>

      {/* Text Editor Modal */}
      <TextEditorModal
        open={showModal}
        onOpenChange={setShowModal}
        value={value}
        type={richText ? 'paragraph' : type}
        onUpdate={handleUpdate}
        placeholder={placeholder}
        maxLength={maxLength}
        projectId={projectId}
      />
    </>
  );
}