'use client';

import React, { createContext, useContext } from 'react';
import { useBuilderStore } from '@/stores/builderStore';
import type { Section } from '@/stores/builderStore';

interface BuilderContextValue {
  sections: Section[];
  publishedSections: Section[];
  pageTitle: string;
  pageId: string | null;
  projectId: string | null;
}

const BuilderContext = createContext<BuilderContextValue | undefined>(undefined);

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const { sections, publishedSections, pageTitle, pageId, projectId } = useBuilderStore();

  return (
    <BuilderContext.Provider
      value={{
        sections,
        publishedSections,
        pageTitle,
        pageId,
        projectId,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilderContext() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilderContext must be used within BuilderProvider');
  }
  return context;
}