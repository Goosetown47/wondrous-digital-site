'use client';

import React, { createContext, useContext } from 'react';

interface Project {
  id: string;
  name: string;
}

interface ProjectContextType {
  project: Project | null;
}

const ProjectContext = createContext<ProjectContextType>({ project: null });

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ project: Project | null; children: React.ReactNode }> = ({ project, children }) => {
  return <ProjectContext.Provider value={{ project }}>{children}</ProjectContext.Provider>;
};