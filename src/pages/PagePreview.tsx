import React, { useState, useEffect, useCallback, createContext } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { applySiteStyleVariables } from '../lib/utils';
import { EditModeProvider } from '../contexts/EditModeContext';
import { CSSSiteStylesProvider } from '../contexts/SiteStylesContext';
import { ProjectContext, Project } from '../contexts/ProjectContext';
import { fontPreloader } from '../utils/font-preloader';
import { renderSection } from '../utils/sectionComponentFactory';
import HeroSplitLayout from '../components/sections/HeroSplitLayout';
import FourFeaturesGrid from '../components/sections/FourFeaturesGrid';
import NavigationDesktop from '../components/sections/NavigationDesktop';
import '../styles/section-typography.css';

interface Section {
  id: string;
  type: string;
  content: Record<string, unknown>;
}

interface Page {
  id: string;
  page_name: string;
  sections: Section[];
  status: string;
  site_colors: Record<string, string>;
  project_id: string;
}

interface PagePreviewProps {
  pageId?: string;
  projectId?: string;
  isEmbedded?: boolean;
  hideGlobalSections?: boolean;
}

const PagePreview: React.FC<PagePreviewProps> = ({ 
  pageId: propPageId, 
  projectId: propProjectId, 
  isEmbedded = false, 
  hideGlobalSections = false 
}) => {
  const { pageId: urlPageId } = useParams<{ pageId: string }>();
  const pageId = propPageId || urlPageId;
  const [page, setPage] = useState<Page | null>(null);
  const [globalNavSection, setGlobalNavSection] = useState<Section | null>(null);
  const [globalFooterSection, setGlobalFooterSection] = useState<Section | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  const fetchPageData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: page, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) {
        throw error;
      }

      if (!page) {
        throw new Error('Page not found');
      }

      setPage(page);
      
      // Fetch and apply site styles after page data is loaded
      if (page?.project_id) {
        // Only apply styles if not embedded (parent component handles styles)
        if (!isEmbedded) {
          await fetchAndApplySiteStyles(page.project_id);
        } else {
          // If embedded, just mark styles as loaded
          setStylesLoaded(true);
        }
        
        if (!hideGlobalSections) {
          await fetchGlobalSections(page.project_id);
        }
      }
    } catch (err) {
      console.error('Error fetching page data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  }, [pageId, hideGlobalSections, isEmbedded]);

  // Performance-optimized font loading from site styles
  const loadFontsFromStyles = async (styles: Record<string, any>) => {
    const fontsToLoad: string[] = [];
    
    // Collect fonts that need to be loaded
    if (styles.primary_font && !loadedFonts.has(styles.primary_font)) {
      fontsToLoad.push(styles.primary_font);
    }
    if (styles.secondary_font && !loadedFonts.has(styles.secondary_font)) {
      fontsToLoad.push(styles.secondary_font);
    }
    
    // Load default fonts if no styles provided
    if (!styles.primary_font && !loadedFonts.has('Inter')) {
      fontsToLoad.push('Inter');
    }
    if (!styles.secondary_font && !loadedFonts.has('Playfair Display')) {
      fontsToLoad.push('Playfair Display');
    }
    
    // Load fonts asynchronously in parallel for better performance
    if (fontsToLoad.length > 0) {
      try {
        await Promise.all(
          fontsToLoad.map(fontName => 
            fontPreloader.loadFont(fontName).catch(error => {
              console.warn(`Failed to load font: ${fontName}`, error);
            })
          )
        );
        
        // Update loaded fonts state
        setLoadedFonts(prev => new Set([...prev, ...fontsToLoad]));
      } catch (error) {
        console.warn('Some fonts failed to load:', error);
      }
    }
  };

  const fetchAndApplySiteStyles = async (projectId: string) => {
    try {
      const { data: siteStyles, error } = await supabase
        .from('site_styles')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching site styles:', error);
        return;
      }

      // Apply site styles as CSS variables
      if (siteStyles) {
        applySiteStyleVariables(siteStyles);
        // Load fonts asynchronously after CSS variables are applied
        await loadFontsFromStyles(siteStyles);
      } else {
        // No custom styles, apply defaults
        applySiteStyleVariables({});
        // Load default fonts
        await loadFontsFromStyles({});
      }
      
      setStylesLoaded(true);
    } catch (err) {
      console.error('Error applying site styles:', err);
      // Apply defaults on error and mark as loaded to prevent blocking
      applySiteStyleVariables({});
      // Load default fonts even on error
      await loadFontsFromStyles({}).catch(fontError => {
        console.warn('Failed to load default fonts on error:', fontError);
      });
      setStylesLoaded(true);
    }
  };
  
  // Fetch global sections
  const fetchGlobalSections = async (projectId: string) => {
    try {
      // First fetch the project to get global section IDs
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, global_nav_section_id, global_footer_section_id')
        .eq('id', projectId)
        .single();
        
      if (projectError) throw projectError;
      if (!project) return;
      
      setCurrentProject(project);
      
      // Fetch global nav section if set
      if (project.global_nav_section_id) {
        const { data: navData, error: navError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('id', project.global_nav_section_id)
          .single();
          
        if (!navError && navData) {
          setGlobalNavSection({
            id: navData.id,
            type: navData.section_type,
            content: navData.content || {}
          });
        }
      }
      
      // Fetch global footer section if set
      if (project.global_footer_section_id) {
        const { data: footerData, error: footerError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('id', project.global_footer_section_id)
          .single();
          
        if (!footerError && footerData) {
          setGlobalFooterSection({
            id: footerData.id,
            type: footerData.section_type,
            content: footerData.content || {}
          });
        }
      }
    } catch (error) {
      console.error('Error fetching global sections:', error);
    }
  };

  useEffect(() => {
    if (pageId) {
      fetchPageData();
    }
  }, [pageId, fetchPageData]);

  const renderSectionComponent = (section: Section) => {
    const getSectionComponent = () => {
      switch (section.type) {
        case 'hero':
          return <HeroSplitLayout sectionId={section.id} content={section.content} />;
        case 'features':
          return <FourFeaturesGrid sectionId={section.id} content={section.content} />;
        case 'navigation':
        case 'navigation-desktop':
          // Provide minimal project context for navigation links to load
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
              setSelectedProject: async () => {}
            }}>
              <NavigationDesktop sectionId={section.id} content={section.content} />
            </ProjectContext.Provider>
          );
        default:
          return (
            <div className="py-8 text-center text-gray-500">
              <p>Section type "{section.type}" not implemented yet</p>
            </div>
          );
      }
    };

    // Wrap each section with EditModeProvider (SiteStyles are already applied at document level)
    return (
      <EditModeProvider 
        key={section.id}
        initialEditMode={false} // Preview mode - no editing
        onContentUpdate={() => {}} // No-op for preview
        isMobilePreview={false} // Could be enhanced later
      >
        {getSectionComponent()}
      </EditModeProvider>
    );
  };

  if (loading || !stylesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Page</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">The requested page could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <CSSSiteStylesProvider>
      <div className="min-h-screen bg-gray-50">
        <style>{`
          /* Full-width preview - sections handle their own content constraints */
        `}</style>
        
        {/* Full-width container for sections with individual content constraints */}
        <div className="website-content bg-white min-h-screen">
          {/* Global Navigation */}
          {!hideGlobalSections && globalNavSection && (
            <div className="sticky top-0 z-40">
              {renderSectionComponent(globalNavSection)}
            </div>
          )}
          
          {/* Page Sections */}
          {page.sections?.map(renderSectionComponent)}
          
          {/* Global Footer */}
          {!hideGlobalSections && globalFooterSection && renderSectionComponent(globalFooterSection)}
        </div>
      </div>
    </CSSSiteStylesProvider>
  );
};

export default PagePreview;