'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context shape
interface EditModeContextType {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  activeEditField: string | null;
  setActiveEditField: (fieldName: string | null) => void;
  onContentUpdate?: (fieldName: string, value: any) => void;
  isMobilePreview?: boolean;
}

// Create the context with default values
export const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  setEditMode: () => {},
  activeEditField: null,
  setActiveEditField: () => {},
  onContentUpdate: undefined,
  isMobilePreview: false,
});

// Define props for the provider component
interface EditModeProviderProps {
  children: ReactNode;
  initialEditMode?: boolean;
  onContentUpdate?: (fieldName: string, value: any) => void;
  isMobilePreview?: boolean;
}

// Create a provider component
export const EditModeProvider: React.FC<EditModeProviderProps> = ({ 
  children, 
  initialEditMode = false,
  onContentUpdate, 
  isMobilePreview = false,
}) => {
  const [editMode, setEditMode] = useState(initialEditMode);
  const [activeEditField, setActiveEditField] = useState<string | null>(null);

  // Update editMode when initialEditMode prop changes
  React.useEffect(() => {
    setEditMode(initialEditMode);
  }, [initialEditMode]);

  return (
    <EditModeContext.Provider 
      value={{ 
        editMode, 
        setEditMode, 
        activeEditField, 
        setActiveEditField,
        onContentUpdate,
        isMobilePreview,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
};

// Create a hook for easy access to the context
export const useEditMode = () => useContext(EditModeContext);