import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { CSSSiteStylesProvider } from '../contexts/SiteStylesContext';
import { EditModeProvider } from '../contexts/EditModeContext';
import PagePreview from './PagePreview';
import NavigationDesktop from '../components/sections/NavigationDesktop';
import { Loader2 } from 'lucide-react';
import { NavigationLink, organizeLinksHierarchy } from '../hooks/useNavigationLinks';
import { applySiteStyleVariables } from '../lib/utils';
import { fontPreloader } from '../utils/font-preloader';

interface Page {
  id: string;
  page_name: string;
  slug: string;
  is_homepage: boolean;
  status: string;
  sections: any[];
  order_index: number;
}

interface Project {
  id: string;
  project_name: string;
  project_status: string;
  global_nav_section_id: string | null;
  global_footer_section_id: string | null;
}

interface GlobalSection {
  id: string;
  section_type: string;
  content: any;
}

const ProjectPreview: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // State
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [globalNavSection, setGlobalNavSection] = useState<GlobalSection | null>(null);
  const [globalFooterSection, setGlobalFooterSection] = useState<GlobalSection | null>(null);
  const [navigationLinks, setNavigationLinks] = useState<NavigationLink[]>([]);
  const [footerLinks, setFooterLinks] = useState<NavigationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

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

  // Fetch and apply site styles
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
      await loadFontsFromStyles({}).catch(() => {
        console.warn('Failed to load default fonts');
      });
      setStylesLoaded(true);
    }
  };

  // Fetch project data and pages
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || projectId === 'undefined') {
        setError('Invalid project ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        if (!projectData) throw new Error('Project not found');

        setProject(projectData);

        // Fetch and apply site styles
        await fetchAndApplySiteStyles(projectData.id);

        // Fetch all pages for the project
        const { data: pagesData, error: pagesError } = await supabase
          .from('pages')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true });

        if (pagesError) throw pagesError;
        
        const publishedPages = pagesData?.filter(page => page.status === 'published') || [];
        setPages(publishedPages);

        // Set initial page (homepage or first page)
        const homepage = publishedPages.find(p => p.is_homepage);
        const initialPage = homepage || publishedPages[0];
        if (initialPage) {
          setCurrentPageId(initialPage.id);
        }

        // Fetch global sections
        if (projectData.global_nav_section_id) {
          const { data: navData } = await supabase
            .from('page_sections')
            .select('*')
            .eq('id', projectData.global_nav_section_id)
            .single();
          
          if (navData) {
            setGlobalNavSection(navData);
            
            // Fetch navigation links for the global nav
            const { data: linksData } = await supabase
              .from('navigation_links')
              .select('*')
              .eq('section_id', navData.id)
              .order('position', { ascending: true });
            
            if (linksData) {
              // Organize links into hierarchy
              const organizedLinks = organizeLinksHierarchy(linksData);
              setNavigationLinks(organizedLinks);
            }
          }
        }

        if (projectData.global_footer_section_id) {
          const { data: footerData } = await supabase
            .from('page_sections')
            .select('*')
            .eq('id', projectData.global_footer_section_id)
            .single();
          
          if (footerData) {
            setGlobalFooterSection(footerData);
            
            // Fetch navigation links for the global footer
            const { data: footerLinksData } = await supabase
              .from('navigation_links')
              .select('*')
              .eq('section_id', footerData.id)
              .order('position', { ascending: true });
            
            if (footerLinksData) {
              // Organize footer links into hierarchy
              const organizedFooterLinks = organizeLinksHierarchy(footerLinksData);
              setFooterLinks(organizedFooterLinks);
            }
          }
        }

      } catch (err) {
        console.error('Error fetching project data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Handle navigation between pages
  const handlePageNavigation = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setCurrentPageId(pageId);
      window.scrollTo(0, 0);
    }
  };

  // Handle navigation link clicks
  const handleNavigationClick = (link: NavigationLink | { href?: string }) => {
    // Handle logo click - navigate to homepage
    if ('href' in link && link.href === '/') {
      const homepage = pages.find(p => p.is_homepage) || pages[0];
      if (homepage) {
        handlePageNavigation(homepage.id);
      }
      return;
    }
    
    // Handle regular navigation links
    if ('link_type' in link) {
      if (link.link_type === 'page' && link.page_id) {
        handlePageNavigation(link.page_id);
      } else if (link.link_type === 'external' && link.link_url) {
        if (link.external_new_tab) {
          window.open(link.link_url, '_blank');
        } else {
          window.location.href = link.link_url;
        }
      }
    }
  };

  // Render navigation section
  const renderNavigationSection = (section: GlobalSection | null, isGlobal: boolean = false, isFooter: boolean = false) => {
    if (!section) return null;

    const sectionType = section.section_type;
    const sectionProps = {
      content: section.content,
      sectionId: section.id,
      navigationLinks: isFooter ? footerLinks : navigationLinks,
      onLinkClick: handleNavigationClick,
      currentPageId: currentPageId,
      isGlobal: isGlobal,
      isMobilePreview: false
    };

    switch (sectionType) {
      case 'navigation-desktop':
      case 'navigation':
        return <NavigationDesktop {...sectionProps} />;
      
      // Future navigation components will be added here as they're built
      // case 'navigation-navbar-2':
      //   return <NavigationNavbar2 {...sectionProps} />;
      // case 'navigation-footer-1':
      //   return <NavigationFooter1 {...sectionProps} />;
      
      default:
        // For now, default to NavigationDesktop for any navigation type
        console.warn(`Navigation type "${sectionType}" not yet implemented, using NavigationDesktop`);
        return <NavigationDesktop {...sectionProps} />;
    }
  };

  if (loading || !stylesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !project || pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Invalid project ID' ? 'Invalid Project' : error || 'No published pages found'}
          </h1>
          <p className="text-gray-600 mb-4">
            {error === 'Invalid project ID' 
              ? 'The project ID is invalid. Please return to the dashboard and select a project.'
              : error 
              ? 'Please check the project ID and try again.' 
              : 'This project has no published pages to preview.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentPage = pages.find(p => p.id === currentPageId);

  return (
    <CSSSiteStylesProvider>
      <EditModeProvider>
        <div className="min-h-screen flex flex-col">
          {/* Preview Header */}
          <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-center">
            <span className="text-sm">
              Previewing: <strong>{project.project_name}</strong> | <strong>{currentPage?.page_name || 'Loading...'}</strong>
            </span>
          </div>

          {/* Global Navigation */}
          {globalNavSection && (
            <div className="sticky top-0 z-40">
              {renderNavigationSection(globalNavSection, true)}
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1">
            {currentPage && (
              <PagePreview 
                key={currentPageId}
                pageId={currentPageId}
                projectId={projectId}
                isEmbedded={true}
                hideGlobalSections={true}
              />
            )}
          </div>

          {/* Global Footer */}
          {globalFooterSection && (
            <div className="mt-auto">
              {renderNavigationSection(globalFooterSection, true, true)}
            </div>
          )}
        </div>
      </EditModeProvider>
    </CSSSiteStylesProvider>
  );
};

export default ProjectPreview;