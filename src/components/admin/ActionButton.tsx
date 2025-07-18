import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip && buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Position tooltip above the button
      tooltipRef.current.style.left = `${buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2)}px`;
      tooltipRef.current.style.top = `${buttonRect.top - tooltipRect.height - 8}px`;
    }
  }, [showTooltip]);

  const baseClasses = 'p-1.5 rounded-md transition-colors';
  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
    danger: 'text-red-600 hover:text-red-800 hover:bg-red-50'
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        aria-label={label}
      >
        <Icon className="h-4 w-4" />
      </button>
      
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg pointer-events-none"
        >
          {label}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </>
  );
};

export default ActionButton;