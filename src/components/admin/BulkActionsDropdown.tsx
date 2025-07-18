import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Archive, Trash2, Edit3, AlertCircle } from 'lucide-react';

export type BulkAction = 'change-status' | 'archive' | 'delete';

interface BulkActionsDropdownProps {
  selectedCount: number;
  onAction: (action: BulkAction) => void;
  allowedActions: {
    changeStatus: boolean;
    archive: boolean;
    delete: boolean;
  };
  className?: string;
}

const BulkActionsDropdown: React.FC<BulkActionsDropdownProps> = ({
  selectedCount,
  onAction,
  allowedActions,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: BulkAction) => {
    onAction(action);
    setIsOpen(false);
  };

  const actions = [
    {
      id: 'change-status' as BulkAction,
      label: 'Change Status',
      icon: Edit3,
      enabled: allowedActions.changeStatus,
      description: 'Update status for all selected projects'
    },
    {
      id: 'archive' as BulkAction,
      label: 'Archive',
      icon: Archive,
      enabled: allowedActions.archive,
      description: 'Move selected projects to archive'
    },
    {
      id: 'delete' as BulkAction,
      label: 'Delete',
      icon: Trash2,
      enabled: allowedActions.delete,
      description: 'Permanently delete selected projects',
      variant: 'danger' as const
    }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <span className="text-sm font-medium">
          Bulk Actions ({selectedCount})
        </span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {actions.map((action) => {
              const Icon = action.icon;
              const isDisabled = !action.enabled;
              
              return (
                <button
                  key={action.id}
                  onClick={() => !isDisabled && handleAction(action.id)}
                  disabled={isDisabled}
                  className={`
                    w-full flex items-start px-4 py-2 text-sm
                    ${isDisabled 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : action.variant === 'danger'
                        ? 'text-red-700 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                    transition-colors
                  `}
                >
                  <Icon className={`h-4 w-4 mr-3 mt-0.5 ${
                    isDisabled ? 'text-gray-300' : action.variant === 'danger' ? 'text-red-500' : 'text-gray-400'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className={`text-xs ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                      {action.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {!allowedActions.delete && allowedActions.archive && (
            <div className="border-t border-gray-200 px-4 py-2">
              <div className="flex items-start text-xs text-gray-500">
                <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>Projects must be archived before they can be deleted</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkActionsDropdown;