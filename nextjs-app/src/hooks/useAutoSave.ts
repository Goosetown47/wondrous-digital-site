import { useEffect, useRef, useCallback } from 'react';
import { useBuilderStore } from '@/stores/builderStore';
import { useSaveDraft } from './usePages';

export function useAutoSave() {
  const { 
    isDirty, 
    sections, 
    pageId, 
    markClean,
    setSaveStatus,
    setLastSavedAt 
  } = useBuilderStore();
  
  const saveDraft = useSaveDraft();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced save function - now saves draft only
  const performSave = useCallback(async () => {
    if (!pageId || !isDirty) return;
    
    setSaveStatus('saving');
    
    try {
      await new Promise((resolve, reject) => {
        saveDraft.mutate({
          pageId,
          sections,
        }, {
          onSuccess: () => {
            markClean();
            setSaveStatus('saved');
            setLastSavedAt(new Date());
            resolve(true);
          },
          onError: (error) => {
            setSaveStatus('error', error instanceof Error ? error.message : 'Save failed');
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [pageId, sections, isDirty, saveDraft, markClean, setSaveStatus, setLastSavedAt]);
  
  // Watch for isDirty changes and trigger auto-save
  useEffect(() => {
    if (isDirty) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for 2 seconds
      saveTimeoutRef.current = setTimeout(() => {
        performSave();
      }, 2000);
    }
    
    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isDirty, performSave]);
  
  // Save immediately on demand
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    return performSave();
  }, [performSave]);
  
  // Handle beforeunload to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
  
  return {
    saveNow,
    isSaving: saveDraft.isPending,
  };
}