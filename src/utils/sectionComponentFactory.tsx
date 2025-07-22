import React from 'react';
import HeroSplitLayout from '../components/sections/HeroSplitLayout';
import FourFeaturesGrid from '../components/sections/FourFeaturesGrid';
import NavigationDesktop from '../components/sections/NavigationDesktop';
import { EditModeProvider } from '../contexts/EditModeContext';
import { ProjectContext, Project } from '../contexts/ProjectContext';

interface Section {
  id: string;
  type: string;
  content: Record<string, unknown>;
}

interface RenderSectionOptions {
  section: Section;
  isMobilePreview?: boolean;
  currentProject?: Project | null;
  page?: { project_id: string; page_name: string } | null;
  onContentUpdate?: (sectionId: string, fieldName: string, value: any) => void;
  editMode?: boolean;
}

/**
 * Factory function to get the appropriate component for a section type
 */
export function getSectionComponent(sectionType: string, props: any): React.ReactElement | null {
  switch (sectionType) {
    case 'hero':
      return <HeroSplitLayout {...props} />;
      
    case 'features':
      return <FourFeaturesGrid {...props} />;
      
    case 'navigation':
    case 'navigation-desktop':
      return <NavigationDesktop {...props} />;
      
    default:
      console.warn(`Unknown section type: ${sectionType}`);
      return null;
  }
}

/**
 * Renders a section with all necessary providers and props
 * This centralizes the rendering logic used in both PagePreview and PageBuilder
 */
export function renderSection(options: RenderSectionOptions): React.ReactElement | null {
  const { 
    section, 
    isMobilePreview = false, 
    currentProject, 
    page,
    onContentUpdate = () => {},
    editMode = false
  } = options;
  
  // Special handling for navigation sections that need project context
  if (section.type === 'navigation' || section.type === 'navigation-desktop') {
    const mockProject: Project = currentProject || {
      id: page?.project_id || '',
      project_name: page?.page_name || '',
      domain: null,
      project_type: 'customer_site',
      customer_id: null,
      niche: null,
      global_nav_section_id: null,
      global_footer_section_id: null
    };
    
    return (
      <EditModeProvider
        key={section.id}
        initialEditMode={editMode}
        onContentUpdate={(fieldName, value) => onContentUpdate(section.id, fieldName, value)}
        isMobilePreview={isMobilePreview}
      >
        <ProjectContext.Provider value={{
          userProfile: null,
          accounts: [],
          projects: [mockProject],
          filteredProjects: [mockProject],
          selectedAccount: null,
          selectedProject: mockProject,
          loading: false,
          projectSwitching: false,
          setSelectedAccount: async () => {},
          setSelectedProject: async () => {},
          refetchProjects: async () => {}
        }}>
          <NavigationDesktop
            sectionId={section.id}
            content={section.content}
            isMobilePreview={isMobilePreview}
          />
        </ProjectContext.Provider>
      </EditModeProvider>
    );
  }
  
  // Standard section rendering
  const component = getSectionComponent(section.type, {
    sectionId: section.id,
    content: section.content,
    isMobilePreview
  });
  
  if (!component) {
    return null;
  }
  
  return (
    <EditModeProvider
      key={section.id}
      initialEditMode={editMode}
      onContentUpdate={(fieldName, value) => onContentUpdate(section.id, fieldName, value)}
      isMobilePreview={isMobilePreview}
    >
      {component}
    </EditModeProvider>
  );
}