'use client';

import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonEditorModal, type ButtonData } from './ButtonEditorModal';

interface EditableButtonProps {
  buttonData: ButtonData;
  onUpdate: (data: ButtonData) => void;
  editable?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function EditableButton({
  buttonData,
  onUpdate,
  editable = false,
  children,
  className,
}: EditableButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!editable) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      <div
        className={cn('relative inline-block', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Render the button */}
        <div className={cn(
          'cursor-pointer transition-all',
          'hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-module-primary/50'
        )}>
          {children}
        </div>

        {/* Hover indicator */}
        {isHovered && (
          <div className="absolute -top-8 left-0 z-50 flex items-center gap-1 px-2 py-1 bg-module-primary text-white rounded-md text-xs whitespace-nowrap pointer-events-none">
            <Edit2 className="h-3 w-3" />
            <span>Click to edit button</span>
          </div>
        )}
      </div>

      {/* Button Editor Modal */}
      <ButtonEditorModal
        open={showModal}
        onOpenChange={setShowModal}
        buttonData={buttonData}
        onUpdate={onUpdate}
      />
    </>
  );
}
