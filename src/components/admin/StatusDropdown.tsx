import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface StatusOption<T> {
  value: T;
  label: string;
  color: string;
}

interface StatusDropdownProps<T> {
  value: T;
  options: StatusOption<T>[];
  onChange: (value: T) => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  className?: string;
  entityName?: string;
}

function StatusDropdown<T extends string>({
  value,
  options,
  onChange,
  onConfirm,
  confirmLabel = 'Update',
  className = '',
  entityName
}: StatusDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [hasChanges, setHasChanges] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value);
    setHasChanges(false);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: T) => {
    setSelectedValue(newValue);
    setHasChanges(newValue !== value);
    if (!onConfirm) {
      onChange(newValue);
      setIsOpen(false);
    }
  };

  const handleConfirm = () => {
    onChange(selectedValue);
    setIsOpen(false);
    setHasChanges(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setSelectedValue(value);
    setHasChanges(false);
    setIsOpen(false);
  };

  const currentOption = options.find(opt => opt.value === selectedValue);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium
          ${currentOption?.color || 'bg-gray-100 text-gray-800'}
          hover:opacity-90 transition-opacity
        `}
      >
        {currentOption?.label || selectedValue}
        <ChevronDown className="ml-2 h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 min-w-[14rem] max-w-sm rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center justify-between px-4 py-2 text-sm
                  ${selectedValue === option.value ? 'bg-gray-50' : ''}
                  hover:bg-gray-100
                `}
              >
                <span className="flex items-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${option.color}`}>
                    {option.label}
                  </span>
                </span>
                {selectedValue === option.value && (
                  <Check className="h-4 w-4 text-gray-600" />
                )}
              </button>
            ))}
          </div>
          
          {onConfirm && hasChanges && (
            <div className="border-t border-gray-200 px-4 py-3">
              {entityName && (
                <p className="text-sm text-gray-600 mb-3 whitespace-normal">
                  Change <span className="font-medium">{entityName}</span> status from{' '}
                  <span className="font-medium">{options.find(opt => opt.value === value)?.label}</span> to{' '}
                  <span className="font-medium">{options.find(opt => opt.value === selectedValue)?.label}</span>?
                </p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StatusDropdown;