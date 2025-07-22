import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabase';
import { useProject } from '../../../contexts/ProjectContext';
import { EditModeProvider, useEditMode } from '../../../contexts/EditModeContext';
import { CSSSiteStylesProvider } from '../../../contexts/SiteStylesContext';
import { applySiteStyleVariables } from '../../../lib/utils';
import { Save, Eye, EyeOff, Smartphone, PanelTop, Loader, GripVertical, ChevronDown, ChevronUp, Trash2, X, ChevronLeft, ChevronRight, Settings, ExternalLink } from 'lucide-react';
import HeroSplitLayout from '../../../components/sections/HeroSplitLayout';
import FourFeaturesGrid from '../../../components/sections/FourFeaturesGrid';
import NavigationDesktop from '../../../components/sections/NavigationDesktop';
import TemplateSectionPlaceholder from '../../../components/template/TemplateSectionPlaceholder';
import { TemplatePreview } from '../../../components/template/TemplatePreview';
import { fetchSectionTemplate } from '../../../services/templateService';
import EnhancedSectionSettingsModal from '../../../components/admin/EnhancedSectionSettingsModal';
import SectionLibrarySidebar from '../../../components/admin/SectionLibrarySidebar';
import { SectionType } from '../../../components/admin/SectionTypeCard';

// Define the type for a section in the page
interface Section {
  id: string;
  type: string;
  content: any;
}

// Define the type for a section template from the database
interface SectionTemplate {
  id: string;
  section_type: string;
  template_name: string;
  preview_image_url: string | null;
  customizable_fields: any;
  default_content?: any;
  category: string | null;
  status: 'active' | 'inactive' | 'testing';
}

const PageBuilderPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { selectedProject, refetchProject } = useProject();
  const { activeEditField } = useEditMode();
  
  // Page data state
  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [globalNavSection, setGlobalNavSection] = useState<Section | null>(null);
  const [globalFooterSection, setGlobalFooterSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteColors, setSiteColors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  
  // Drag and drop state
  const [draggedSectionType, setDraggedSectionType] = useState<SectionType | null>(null);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dragOverSection, setDragOverSection] = useState<boolean>(false);
  
  // Editing state
  const [editingFieldName, setEditingFieldName] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  
  // Template state
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isSectionSettingsModalOpen, setIsSectionSettingsModalOpen] = useState<boolean>(false);
  const [sectionTemplates, setSectionTemplates] = useState<Map<string, any>>(new Map());
  
  // Auto-save timer
  const autoSaveTimerRef = useRef<number | null>(null);
  
  // Load page data when component mounts
  useEffect(() => {
    if (pageId && selectedProject) {
      fetchPageData();
      fetchGlobalSections();
    }
    
    // Set up autosave
    autoSaveTimerRef.current = window.setInterval(() => {
      if (hasChanges) {
        savePageData();
      }
    }, 30000); // Auto-save every 30 seconds
    
    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [pageId, selectedProject]);

  // Re-fetch global sections when project global settings change
  useEffect(() => {
    if (selectedProject) {
      console.log('🔄 Project global section IDs changed, re-fetching global sections');
      fetchGlobalSections();
    }
  }, [selectedProject?.global_nav_section_id, selectedProject?.global_footer_section_id]);

  // Fetch page data from the database
  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: page, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single();
        
      if (error) throw error;
      
      setPage(page);
      
      // Parse sections from JSON
      const pageSections = page.sections || [];
      setSections(pageSections);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching page data:', err);
      setError(err.message || 'Failed to load page');
      setLoading(false);
    }
  };
  

  // Fetch the first active template for a given section type
  const fetchDefaultTemplateForType = async (sectionType: SectionType): Promise<SectionTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('section_templates')
        .select('*')
        .eq('section_type', sectionType)
        .eq('status', 'active')
        .order('template_name')
        .limit(1)
        .maybeSingle();
        
      if (error) throw error;
      
      return data;
    } catch (err: any) {
      console.error('Error fetching default template for type:', sectionType, err);
      return null;
    }
  };
  
  // Save page data to the database
  const savePageData = async () => {
    if (!pageId || !page) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const { error } = await supabase
        .from('pages')
        .update({
          sections: sections,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId);
        
      if (error) throw error;
      
      // Show save message and clear after 3 seconds
      setSaveMessage('Page saved successfully');
      setHasChanges(false);
      
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving page data:', err);
      setError(err.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  // Open page in new browser window for preview
  const handleViewInBrowser = () => {
    if (pageId) {
      const previewUrl = `/preview/${pageId}`;
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Fetch site styles
  useEffect(() => {
    if (selectedProject) {
      fetchSiteStyles();
    }
  }, [selectedProject]);
  
  // Function to fetch site styles
  const fetchSiteStyles = async () => {
    try {
      const { data, error } = await supabase
        .from('site_styles')
        .select('*')
        .eq('project_id', selectedProject.id)
        .maybeSingle();
        
      if (error) throw error;
      
      // Apply full site styles if available
      if (data) {
        // Apply all CSS variables for buttons, typography, colors, etc.
        applySiteStyleVariables(data);
        
        // Extract color properties for legacy setSiteColors
        const colorEntries = Object.entries(data)
          .filter(([key, value]) => 
            (key.includes('color') || key.includes('gradient')) && 
            typeof value === 'string' && 
            value.length > 0
          );
          
        const colorObj = Object.fromEntries(colorEntries);
        setSiteColors(colorObj);
      } else {
        // No custom styles, apply defaults
        applySiteStyleVariables({});
      }
      
      // Mark styles as loaded
      setStylesLoaded(true);
    } catch (err) {
      console.error('Error fetching site styles:', err);
      // Apply defaults on error and mark as loaded to prevent blocking
      applySiteStyleVariables({});
      setStylesLoaded(true);
    }
  };
  
  // Fetch global sections (nav and footer)
  const fetchGlobalSections = async () => {
    if (!selectedProject) return;
    
    console.log('🔍 fetchGlobalSections - selectedProject:', selectedProject);
    console.log('🔍 fetchGlobalSections - global_nav_section_id:', selectedProject.global_nav_section_id);
    console.log('🔍 fetchGlobalSections - global_footer_section_id:', selectedProject.global_footer_section_id);
    
    try {
      // Fetch global nav section if set
      if (selectedProject.global_nav_section_id) {
        console.log('🔍 Fetching global nav section...');
        const { data: navData, error: navError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('id', selectedProject.global_nav_section_id)
          .single();
          
        console.log('🔍 Nav section query result:', { navData, navError });
          
        if (!navError && navData) {
          const globalNavSectionData = {
            id: navData.id,
            type: navData.section_type,
            content: navData.content || {}
          };
          console.log('🔍 Setting globalNavSection to:', globalNavSectionData);
          setGlobalNavSection(globalNavSectionData);
        }
      } else {
        console.log('🔍 No global nav section ID, clearing globalNavSection');
        setGlobalNavSection(null);
      }
      
      // Fetch global footer section if set
      if (selectedProject.global_footer_section_id) {
        const { data: footerData, error: footerError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('id', selectedProject.global_footer_section_id)
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
  
  
  // Handle section drag start for reordering
  const handleSectionDragStart = (index: number, event: React.DragEvent) => {
    setDraggedSectionIndex(index);
    
    if (event.dataTransfer) {
      const ghostElement = document.createElement('div');
      ghostElement.classList.add('bg-white', 'p-2', 'rounded', 'shadow');
      ghostElement.textContent = `Section ${index + 1}`;
      document.body.appendChild(ghostElement);
      
      event.dataTransfer.setDragImage(ghostElement, 0, 0);
      event.dataTransfer.effectAllowed = 'move';
      
      setTimeout(() => {
        document.body.removeChild(ghostElement);
      }, 0);
    }
  };
  
  // Handle section drag over for highlighting drop zones
  const handleDragOver = (index: number, event: React.DragEvent) => {
    event.preventDefault();
    setDropTargetIndex(index);
  };
  
  // Handle section drop for new sections or reordering
  const handleDrop = async (index: number, event: React.DragEvent) => {
    event.preventDefault();
    
    // Reset drag states
    setDropTargetIndex(null);
    
    // Extract section type from drag data
    const droppedSectionType = event.dataTransfer.getData('text/plain') as SectionType;
    
    // Case 1: Adding a new section from the library by type
    if (droppedSectionType || draggedSectionType) {
      const sectionTypeToUse = droppedSectionType || draggedSectionType;
      try {
        // Fetch the default template for this section type
        const defaultTemplate = await fetchDefaultTemplateForType(sectionTypeToUse);
        
        if (defaultTemplate) {
          // Create a new section based on the default template
          const newSection: Section = {
            id: Math.random().toString(36).substr(2, 9), // Generate unique ID
            type: defaultTemplate.section_type,
            // Use default_content if available, fallback to customizable_fields or empty object
            content: defaultTemplate.default_content || defaultTemplate.customizable_fields || {}
          };
          
          // Insert the new section at the specified index
          const newSections = [...sections];
          newSections.splice(index, 0, newSection);
          
          setSections(newSections);
          setHasChanges(true);
        } else {
          // Fallback: create a basic section if no template found
          const newSection: Section = {
            id: Math.random().toString(36).substr(2, 9),
            type: sectionTypeToUse,
            content: {}
          };
          
          const newSections = [...sections];
          newSections.splice(index, 0, newSection);
          
          setSections(newSections);
          setHasChanges(true);
        }
      } catch (error) {
        console.error('Error creating section from type:', error);
      }
      
      setDraggedSectionType(null);
      return;
    }
    
    // Case 2: Reordering existing sections
    if (draggedSectionIndex !== null && draggedSectionIndex !== index) {
      const newSections = [...sections];
      const [removed] = newSections.splice(draggedSectionIndex, 1);
      
      // Adjust index if moving to a later position
      const adjustedIndex = draggedSectionIndex < index ? index - 1 : index;
      newSections.splice(adjustedIndex, 0, removed);
      
      setSections(newSections);
      setDraggedSectionIndex(null);
      setHasChanges(true);
    }
  };
  
  // Handle drag end for cleanup
  const handleDragEnd = () => {
    setDraggedSectionType(null);
    setDraggedSectionIndex(null);
    setDropTargetIndex(null);
    setDragOverSection(false);
  };

  
  
  // Handle content updates from editable components
  const handleContentUpdate = (sectionId: string, fieldName: string, value: any) => {
    // Find the section to update
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        // Create a new content object with the updated value
        const updatedContent = {
          ...section.content,
          [fieldName]: value
        };
        
        return {
          ...section,
          content: updatedContent
        };
      }
      
      return section;
    });
    
    setSections(updatedSections);
    setHasChanges(true);
  };
  
  // Handle opening the section settings modal
  const openSectionSettings = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsSectionSettingsModalOpen(true);
  };
  
  // Handle saving section settings
  const handleSaveSectionSettings = async (sectionId: string, settings: { 
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundGradient?: string;
    backgroundBlur?: number;
    backgroundType: 'color' | 'image' | 'gradient';
    templateId?: string;
  }) => {
    const updatedSections = await Promise.all(sections.map(async section => {
      if (section.id === sectionId) {
        let updatedContent = {
          ...section.content,
          backgroundColor: settings.backgroundColor,
          backgroundImage: settings.backgroundImage,
          backgroundGradient: settings.backgroundGradient,
          backgroundBlur: settings.backgroundBlur,
          backgroundType: settings.backgroundType
        };

        // If a new template is selected, fetch and apply its content
        if (settings.templateId) {
          try {
            const { data: template, error } = await supabase
              .from('section_templates')
              .select('*')
              .eq('id', settings.templateId)
              .single();

            if (error) throw error;

            if (template) {
              // Merge template fields with existing content, preserving background settings
              updatedContent = {
                ...template.customizable_fields,
                ...updatedContent, // This ensures background settings are preserved
              };
            }
          } catch (error) {
            console.error('Error fetching template:', error);
          }
        }

        return {
          ...section,
          content: updatedContent
        };
      }
      return section;
    }));
    
    setSections(updatedSections);
    setHasChanges(true);
    setIsSectionSettingsModalOpen(false);
  };

  // Handle saving global navigation section settings
  const handleSaveGlobalNavSettings = async (sectionId: string, settings: { 
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundGradient?: string;
    backgroundBlur?: number;
    backgroundType: 'color' | 'image' | 'gradient';
    templateId?: string;
  }) => {
    if (!globalNavSection) return;

    let updatedContent = {
      ...globalNavSection.content,
      backgroundColor: settings.backgroundColor,
      backgroundImage: settings.backgroundImage,
      backgroundGradient: settings.backgroundGradient,
      backgroundBlur: settings.backgroundBlur,
      backgroundType: settings.backgroundType
    };

    // If a new template is selected, fetch and apply its content
    if (settings.templateId) {
      try {
        const { data: template, error } = await supabase
          .from('section_templates')
          .select('*')
          .eq('id', settings.templateId)
          .single();

        if (error) throw error;

        if (template) {
          updatedContent = {
            ...template.customizable_fields,
            ...updatedContent,
          };
        }
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    }

    // Update local state
    const updatedGlobalNavSection = {
      ...globalNavSection,
      content: updatedContent
    };
    setGlobalNavSection(updatedGlobalNavSection);

    // Save to database
    try {
      const { error } = await supabase
        .from('page_sections')
        .update({ content: updatedContent })
        .eq('id', globalNavSection.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving global navigation section:', error);
    }

    setHasChanges(true);
    setIsSectionSettingsModalOpen(false);
  };

  // Handle saving global footer section settings
  const handleSaveGlobalFooterSettings = async (sectionId: string, settings: { 
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundGradient?: string;
    backgroundBlur?: number;
    backgroundType: 'color' | 'image' | 'gradient';
    templateId?: string;
  }) => {
    if (!globalFooterSection) return;

    let updatedContent = {
      ...globalFooterSection.content,
      backgroundColor: settings.backgroundColor,
      backgroundImage: settings.backgroundImage,
      backgroundGradient: settings.backgroundGradient,
      backgroundBlur: settings.backgroundBlur,
      backgroundType: settings.backgroundType
    };

    // If a new template is selected, fetch and apply its content
    if (settings.templateId) {
      try {
        const { data: template, error } = await supabase
          .from('section_templates')
          .select('*')
          .eq('id', settings.templateId)
          .single();

        if (error) throw error;

        if (template) {
          updatedContent = {
            ...template.customizable_fields,
            ...updatedContent,
          };
        }
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    }

    // Update local state
    const updatedGlobalFooterSection = {
      ...globalFooterSection,
      content: updatedContent
    };
    setGlobalFooterSection(updatedGlobalFooterSection);

    // Save to database
    try {
      const { error } = await supabase
        .from('page_sections')
        .update({ content: updatedContent })
        .eq('id', globalFooterSection.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving global footer section:', error);
    }

    setHasChanges(true);
    setIsSectionSettingsModalOpen(false);
  };
  
  // Remove a section from the page
  const removeSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
    setHasChanges(true);
  };
  
  // Move a section up or down
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === sections.length - 1)) {
      return;
    }
    
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the sections
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    setSections(newSections);
    setHasChanges(true);
  };
  
  // Fetch templates when preview mode is activated
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!previewMode || sections.length === 0) {
        return;
      }
      
      const templatesNeeded = new Set<string>();
      
      // Collect all section types that need templates
      sections.forEach(section => {
        if (!sectionTemplates.has(section.id)) {
          templatesNeeded.add(section.type);
        }
      });
      
      // Fetch templates for each type
      for (const sectionType of templatesNeeded) {
        try {
          const template = await fetchSectionTemplate(sectionType);
          if (template) {
            // Store template for each section of this type
            sections.forEach(section => {
              if (section.type === sectionType) {
                setSectionTemplates(prev => new Map(prev).set(section.id, template));
              }
            });
          }
        } catch (error) {
          console.error('Error fetching template for type:', sectionType, error);
        }
      }
    };
    
    fetchTemplates();
  }, [previewMode, sections]);
  
  // Render a specific section based on its type
  const renderSection = (section: Section) => {
    // In preview mode, use TemplatePreview for sections that have templates
    if (previewMode) {
      const template = sectionTemplates.get(section.id);
      if (template && template.html_template) {
        return (
          <TemplatePreview
            template={template.html_template}
            content={section.content}
            sectionType={section.type}
            sectionId={section.id}
            isMobilePreview={mobileView}
            isPreviewMode={true}
          />
        );
      }
    }
    
    // In edit mode (or if no template in preview), use React components
    switch (section.type) {
      case 'hero':
        return (
            <HeroSplitLayout
              content={{
                headline: {
                  text: section.content?.headline?.text || "Medium length hero headline goes here",
                  color: section.content?.headline?.color,
                  lineHeight: section.content?.headline?.lineHeight
                },
                description: {
                  text: section.content?.description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
                  color: section.content?.description?.color,
                  lineHeight: section.content?.description?.lineHeight
                },
                primaryButton: {
                  text: section.content?.primaryButton?.text || "Primary Button",
                  href: section.content?.primaryButton?.href || "#",
                  variant: section.content?.primaryButton?.variant || "primary",
                  icon: section.content?.primaryButton?.icon
                },
                secondaryButton: {
                  text: section.content?.secondaryButton?.text || "Secondary Button",
                  href: section.content?.secondaryButton?.href || "#",
                  variant: section.content?.secondaryButton?.variant || "tertiary",
                  icon: section.content?.secondaryButton?.icon
                },
                heroImage: {
                  src: section.content?.heroImage?.src || "",
                  alt: section.content?.heroImage?.alt || "Hero image",
                  imageScaling: section.content?.heroImage?.imageScaling,
                  containerMode: section.content?.heroImage?.containerMode,
                  containerAspectRatio: section.content?.heroImage?.containerAspectRatio,
                  containerSize: section.content?.heroImage?.containerSize
                },
                backgroundColor: section.content?.backgroundColor || "#FFFFFF",
                backgroundImage: section.content?.backgroundImage,
                backgroundGradient: section.content?.backgroundGradient,
                backgroundBlur: section.content?.backgroundBlur,
                backgroundType: section.content?.backgroundType || 'color'
              }}
              isMobilePreview={mobileView}
            />
        );
      case 'features':
        return (
          <FourFeaturesGrid
            content={{
              tagline: {
                text: section.content?.tagline?.text || "Tagline",
                color: section.content?.tagline?.color,
                lineHeight: section.content?.tagline?.lineHeight
              },
              mainHeading: {
                text: section.content?.mainHeading?.text || "Medium length section heading goes here",
                color: section.content?.mainHeading?.color,
                lineHeight: section.content?.mainHeading?.lineHeight
              },
              description: {
                text: section.content?.description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                color: section.content?.description?.color,
                lineHeight: section.content?.description?.lineHeight
              },
              feature1Icon: {
                icon: typeof section.content?.feature1Icon?.icon === 'string' && 
                      section.content?.feature1Icon?.icon.trim() !== '' ? 
                      section.content?.feature1Icon?.icon : "Box",
                size: section.content?.feature1Icon?.size || 40,
                color: section.content?.feature1Icon?.color
              },
              feature1Heading: {
                text: section.content?.feature1Heading?.text || "Medium length section heading goes here",
                color: section.content?.feature1Heading?.color,
                lineHeight: section.content?.feature1Heading?.lineHeight
              },
              feature1Description: {
                text: section.content?.feature1Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                color: section.content?.feature1Description?.color,
                lineHeight: section.content?.feature1Description?.lineHeight
              },
              feature2Icon: {
                icon: typeof section.content?.feature2Icon?.icon === 'string' && 
                      section.content?.feature2Icon?.icon.trim() !== '' ? 
                      section.content?.feature2Icon?.icon : "Box",
                size: section.content?.feature2Icon?.size || 40,
                color: section.content?.feature2Icon?.color
              },
              feature2Heading: {
                text: section.content?.feature2Heading?.text || "Medium length section heading goes here",
                color: section.content?.feature2Heading?.color,
                lineHeight: section.content?.feature2Heading?.lineHeight
              },
              feature2Description: {
                text: section.content?.feature2Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                color: section.content?.feature2Description?.color,
                lineHeight: section.content?.feature2Description?.lineHeight
              },
              feature3Icon: {
                icon: typeof section.content?.feature3Icon?.icon === 'string' && 
                      section.content?.feature3Icon?.icon.trim() !== '' ? 
                      section.content?.feature3Icon?.icon : "Box",
                size: section.content?.feature3Icon?.size || 40,
                color: section.content?.feature3Icon?.color
              },
              feature3Heading: {
                text: section.content?.feature3Heading?.text || "Medium length section heading goes here",
                color: section.content?.feature3Heading?.color,
                lineHeight: section.content?.feature3Heading?.lineHeight
              },
              feature3Description: {
                text: section.content?.feature3Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                color: section.content?.feature3Description?.color,
                lineHeight: section.content?.feature3Description?.lineHeight
              },
              feature4Icon: {
                icon: typeof section.content?.feature4Icon?.icon === 'string' && 
                      section.content?.feature4Icon?.icon.trim() !== '' ? 
                      section.content?.feature4Icon?.icon : "Box",
                size: section.content?.feature4Icon?.size || 40,
                color: section.content?.feature4Icon?.color
              },
              feature4Heading: {
                text: section.content?.feature4Heading?.text || "Medium length section heading goes here",
                color: section.content?.feature4Heading?.color,
                lineHeight: section.content?.feature4Heading?.lineHeight
              },
              feature4Description: {
                text: section.content?.feature4Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                color: section.content?.feature4Description?.color,
                lineHeight: section.content?.feature4Description?.lineHeight
              },
              primaryButton: {
                text: section.content?.primaryButton?.text || "Button",
                href: section.content?.primaryButton?.href || "#",
                variant: section.content?.primaryButton?.variant || "tertiary",
                icon: section.content?.primaryButton?.icon
              },
              secondaryButton: {
                text: section.content?.secondaryButton?.text || "Button",
                href: section.content?.secondaryButton?.href || "#",
                variant: section.content?.secondaryButton?.variant || "secondary",
                icon: section.content?.secondaryButton?.icon
              },
              backgroundColor: section.content?.backgroundColor || "#FFFFFF",
              backgroundImage: section.content?.backgroundImage,
              backgroundGradient: section.content?.backgroundGradient,
              backgroundBlur: section.content?.backgroundBlur,
              backgroundType: section.content?.backgroundType || 'color'
            }}
            isMobilePreview={mobileView}
          />
        );
      case 'navigation-desktop':
      case 'navigation':
        return (
          <NavigationDesktop
            sectionId={section.id} // Pass the section ID to fetch navigation links
            content={{
              logo: {
                type: section.content?.logo?.type || 'text',
                src: section.content?.logo?.src || '',
                alt: section.content?.logo?.alt || 'Logo',
                text: section.content?.logo?.text || 'Logo',
                href: section.content?.logo?.href || '/'
              },
              backgroundColor: section.content?.backgroundColor || '#FFFFFF',
              textColor: section.content?.textColor || '#000000',
              ctaButton1: {
                text: section.content?.ctaButton1?.text || 'Button',
                href: section.content?.ctaButton1?.href || '#',
                variant: section.content?.ctaButton1?.variant || 'secondary',
                icon: section.content?.ctaButton1?.icon
              },
              ctaButton2: {
                text: section.content?.ctaButton2?.text || 'Button',
                href: section.content?.ctaButton2?.href || '#',
                variant: section.content?.ctaButton2?.variant || 'primary',
                icon: section.content?.ctaButton2?.icon
              }
            }}
            isGlobal={false} // TODO: Check if this is the global nav
            isMobilePreview={mobileView}
          />
        );
      default:
        // For any section type that doesn't have a React component, show placeholder
        return (
          <TemplateSectionPlaceholder
            sectionType={section.type}
            sectionId={section.id}
          />
        );
    }
  };
  
  // Handle keyboard shortcuts (e.g., Ctrl+S for save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save on Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        savePageData();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sections, hasChanges]);
  
  // Show a warning if the user tries to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);
  
  if (loading || !stylesLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader className="h-6 w-6 text-primary-pink animate-spin mr-3" />
        <span className="text-lg text-gray-600">
          {!stylesLoaded ? 'Loading styles...' : 'Loading page builder...'}
        </span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-3">Error Loading Page Builder</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/dashboard/content/pages')} 
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Back to Pages
        </button>
      </div>
    );
  }
  
  if (!page) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-yellow-800 mb-3">Page Not Found</h2>
        <p className="text-yellow-600 mb-4">The requested page could not be found or you don't have permission to edit it.</p>
        <button 
          onClick={() => navigate('/dashboard/content/pages')} 
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          Back to Pages
        </button>
      </div>
    );
  }
  
  
  return (
    <CSSSiteStylesProvider>
      <div className="flex flex-col flex-1 bg-gray-50 h-[calc(100vh-4rem)]">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between w-full sticky top-0 z-20">
          <div className="flex items-center">
            <h1 className="font-semibold text-gray-900">
              {page.page_name} 
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
              </span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {/* Mobile/Desktop Toggle */}
            <div className="border border-gray-200 rounded-lg flex items-center">
              <button
                onClick={() => setMobileView(false)}
                className={`p-1.5 rounded-l-lg ${!mobileView ? 'bg-primary-pink text-white' : 'text-gray-500 hover:text-gray-700'}`}
                title="Desktop view"
              >
                <PanelTop className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileView(true)}
                className={`p-1.5 rounded-r-lg ${mobileView ? 'bg-primary-pink text-white' : 'text-gray-500 hover:text-gray-700'}`}
                title="Mobile view"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            
            {/* Preview Toggle */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`p-1.5 border border-gray-200 rounded-lg ${previewMode ? 'text-primary-pink' : 'text-gray-500 hover:text-gray-700'}`}
              title={previewMode ? "Exit preview" : "Preview"}
            >
              {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            
            {/* View in Browser Button */}
            <button
              onClick={handleViewInBrowser}
              className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors duration-200 text-sm"
              title="View in Browser"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              View in Browser
            </button>
            
            {/* Save Button */}
            <button
              onClick={savePageData}
              disabled={saving || !hasChanges}
              className={`flex items-center px-4 py-1.5 rounded-lg bg-primary-pink text-white text-sm ${(saving || !hasChanges) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark-purple transition-colors duration-200'}`}
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasChanges ? 'Save Changes' : 'Saved'}
                </>
              )}
            </button>
          </div>
        </div>

      {/* Main Content Area - Two Column Layout */}
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Collapse/Expand Tab - only visible when sidebar is collapsed */}
        {!sidebarOpen && (
          <div 
            className="fixed left-[256px] top-[130px] bg-white border border-gray-200 border-l-0 rounded-r-lg p-2 shadow-sm cursor-pointer hover:bg-gray-50 z-40"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </div>
        )}

        {/* Left Sidebar - Section Library */}
        <SectionLibrarySidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          className="h-full"
        />
        
        {/* Section Settings Modal - Regular Sections */}
        {selectedSectionId && sections.find(s => s.id === selectedSectionId) && (
          <EnhancedSectionSettingsModal
            isOpen={isSectionSettingsModalOpen}
            onClose={() => setIsSectionSettingsModalOpen(false)}
            sectionId={selectedSectionId}
            sectionType={sections.find(s => s.id === selectedSectionId)!.type as SectionType}
            initialBgColor={sections.find(s => s.id === selectedSectionId)?.content?.backgroundColor || '#FFFFFF'}
            initialBackgroundType={sections.find(s => s.id === selectedSectionId)?.content?.backgroundType || 'color'}
            initialBackgroundImage={sections.find(s => s.id === selectedSectionId)?.content?.backgroundImage || ''}
            initialBackgroundGradient={sections.find(s => s.id === selectedSectionId)?.content?.backgroundGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}
            initialBackgroundBlur={sections.find(s => s.id === selectedSectionId)?.content?.backgroundBlur || 0}
            onSave={handleSaveSectionSettings}
            siteColors={siteColors}
            sectionData={sections.find(s => s.id === selectedSectionId)}
            pageId={pageId}
            onSectionPromoted={() => {
              // Refresh page data after promotion
              fetchPageData();
              fetchGlobalSections();
              setIsSectionSettingsModalOpen(false);
            }}
            onSectionDemoted={() => {
              // Refresh page data after demotion
              fetchPageData();
              fetchGlobalSections();
              setIsSectionSettingsModalOpen(false);
            }}
          />
        )}

        {/* Section Settings Modal - Global Navigation */}
        {selectedSectionId && globalNavSection && selectedSectionId === globalNavSection.id && (
          <EnhancedSectionSettingsModal
            isOpen={isSectionSettingsModalOpen}
            onClose={() => setIsSectionSettingsModalOpen(false)}
            sectionId={globalNavSection.content?.pageBuilderSectionId || selectedSectionId}
            sectionType={globalNavSection.type as SectionType}
            initialBgColor={globalNavSection.content?.backgroundColor || '#FFFFFF'}
            initialBackgroundType={globalNavSection.content?.backgroundType || 'color'}
            initialBackgroundImage={globalNavSection.content?.backgroundImage || ''}
            initialBackgroundGradient={globalNavSection.content?.backgroundGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}
            initialBackgroundBlur={globalNavSection.content?.backgroundBlur || 0}
            onSave={handleSaveGlobalNavSettings}
            siteColors={siteColors}
            sectionData={globalNavSection}
            pageId={pageId}
            onSectionPromoted={() => {
              // Already promoted, shouldn't happen
              setIsSectionSettingsModalOpen(false);
            }}
            onSectionDemoted={() => {
              // Refresh page data after demotion
              fetchPageData();
              fetchGlobalSections();
              setIsSectionSettingsModalOpen(false);
            }}
          />
        )}

        {/* Section Settings Modal - Global Footer */}
        {selectedSectionId && globalFooterSection && selectedSectionId === globalFooterSection.id && (
          <EnhancedSectionSettingsModal
            isOpen={isSectionSettingsModalOpen}
            onClose={() => setIsSectionSettingsModalOpen(false)}
            sectionId={globalFooterSection.content?.pageBuilderSectionId || selectedSectionId}
            sectionType={globalFooterSection.type as SectionType}
            initialBgColor={globalFooterSection.content?.backgroundColor || '#FFFFFF'}
            initialBackgroundType={globalFooterSection.content?.backgroundType || 'color'}
            initialBackgroundImage={globalFooterSection.content?.backgroundImage || ''}
            initialBackgroundGradient={globalFooterSection.content?.backgroundGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}
            initialBackgroundBlur={globalFooterSection.content?.backgroundBlur || 0}
            onSave={handleSaveGlobalFooterSettings}
            siteColors={siteColors}
            sectionData={globalFooterSection}
            pageId={pageId}
            onSectionPromoted={() => {
              // Already promoted, shouldn't happen
              setIsSectionSettingsModalOpen(false);
            }}
            onSectionDemoted={() => {
              // Refresh page data after demotion
              fetchPageData();
              fetchGlobalSections();
              setIsSectionSettingsModalOpen(false);
            }}
          />
        )}

        {/* Page Canvas with Sections - Full height, centered content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col items-center h-full">
          <div className="bg-white mx-auto my-8" style={{
            maxWidth: mobileView ? '375px' : '1200px', 
            width: mobileView ? '375px' : '100%',
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.08)'
          }}>
              {/* Global Navigation */}
              {globalNavSection && (
                <div className="sticky top-0 z-40 relative">
                  {!previewMode && (
                    <div className="absolute -left-10 top-4 flex flex-col items-center space-y-1 z-10">
                      {/* Settings button for global navigation */}
                      <button 
                        onClick={() => openSectionSettings(globalNavSection.id)}
                        className="p-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900"
                        title="Global navigation settings"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      {/* Delete button for global navigation */}
                      <button 
                        onClick={async () => {
                          // Delete the global navigation section completely
                          if (selectedProject && selectedProject.global_nav_section_id) {
                            try {
                              console.log('🗑️ Deleting global navigation section');
                              
                              // First, clear the global nav reference
                              const { error: updateError } = await supabase
                                .from('projects')
                                .update({ global_nav_section_id: null })
                                .eq('id', selectedProject.id);
                                
                              if (updateError) {
                                console.error('Error clearing global nav reference:', updateError);
                                return;
                              }
                              
                              // Then delete the page_sections record
                              const { error: deleteError } = await supabase
                                .from('page_sections')
                                .delete()
                                .eq('id', selectedProject.global_nav_section_id);
                                
                              if (deleteError) {
                                console.error('Error deleting page_sections record:', deleteError);
                              }
                              
                              // Update local state
                              setGlobalNavSection(null);
                              await refetchProject();
                              setHasChanges(true);
                              
                              console.log('✅ Global navigation deleted successfully');
                            } catch (error) {
                              console.error('Error deleting global navigation:', error);
                            }
                          }
                        }}
                        className="p-1 rounded-full bg-white border border-gray-200 shadow-sm text-red-500 hover:text-red-700"
                        title="Delete global navigation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <EditModeProvider 
                    initialEditMode={!previewMode} 
                    onContentUpdate={(fieldName, value) => {
                      // Update global nav content
                      const updatedSection = {
                        ...globalNavSection,
                        content: {
                          ...globalNavSection.content,
                          [fieldName]: value
                        }
                      };
                      setGlobalNavSection(updatedSection);
                      setHasChanges(true);
                    }}
                    isMobilePreview={mobileView}
                  >
                    {renderSection(globalNavSection)}
                  </EditModeProvider>
                </div>
              )}
              
              {/* First drop zone at the top of the page */}
              <div 
                className={`h-12 w-full flex items-center justify-center transition-all ${
                  !previewMode && dropTargetIndex === 0
                    ? 'bg-primary-pink/10 border-2 border-primary-pink border-dashed'
                    : 'bg-gray-100 border-2 border-gray-300 border-dashed'
                }`}
                onDragOver={(e) => !previewMode && handleDragOver(0, e)}
                onDrop={(e) => !previewMode && handleDrop(0, e)}
                onDragLeave={() => setDropTargetIndex(null)}
              >
                {!previewMode && (
                  <div className="text-xs text-gray-400">
                    {dropTargetIndex === 0
                      ? 'Drop to add section here'
                      : 'Drag sections here'
                    }
                  </div>
                )}
              </div>
              
              {/* Render each section with drop zones in between */}
              {sections.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">This page is empty</h3>
                    <p className="text-gray-600 mb-6">Drag sections from the library to start building your page.</p>
                    {sidebarOpen ? (
                      <p className="text-sm text-gray-500">⬅️ Choose sections from the left sidebar</p>
                    ) : (
                      <button 
                        onClick={() => setSidebarOpen(true)} 
                        className="px-4 py-2 bg-primary-pink text-white rounded-lg"
                      >
                        Open Section Library
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="website-content">
                  {sections
                    .map((section, originalIndex) => {
                      // Filter out sections that are currently set as global navigation or footer
                      // Check both pageBuilderSectionId and the section's original id in content
                      const isGlobalNav = globalNavSection?.content?.pageBuilderSectionId === section.id || 
                                        globalNavSection?.content?.id === section.id;
                      const isGlobalFooter = globalFooterSection?.content?.pageBuilderSectionId === section.id ||
                                           globalFooterSection?.content?.id === section.id;
                      
                      if (isGlobalNav || isGlobalFooter) {
                        // Debug log only when filtering happens
                        console.log('🔍 Filtering out global section:', section.id, isGlobalNav ? '(global nav)' : '(global footer)');
                        return null; // Don't render global sections in the main content
                      }
                      
                      return (
                  <div key={section.id} className="relative">
                    {!previewMode && (
                      <div className="absolute -left-10 top-4 flex flex-col items-center space-y-1 z-10">
                        <button 
                          onClick={() => moveSection(originalIndex, 'up')}
                          disabled={originalIndex === 0}
                          className={`p-1 rounded-full bg-white border border-gray-200 shadow-sm ${originalIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <div 
                          className="p-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 cursor-grab"
                          draggable
                          onDragStart={(e) => handleSectionDragStart(originalIndex, e)}
                          onDragEnd={handleDragEnd}
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <button 
                          onClick={() => moveSection(originalIndex, 'down')}
                          disabled={originalIndex === sections.length - 1}
                          className={`p-1 rounded-full bg-white border border-gray-200 shadow-sm ${originalIndex === sections.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                       <button 
                         onClick={() => openSectionSettings(section.id)}
                         className="p-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900"
                         title="Section settings"
                       >
                         <Settings className="h-4 w-4" />
                       </button>
                        <button 
                          onClick={() => removeSection(originalIndex)}
                          className="p-1 rounded-full bg-white border border-gray-200 shadow-sm text-red-500 hover:text-red-700"
                          title="Delete section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Section content */}
                    <div 
                      className={`relative transition-all duration-300 ${!previewMode ? 'group' : ''} ${
                        !previewMode && dragOverSection && draggedSectionIndex === originalIndex 
                          ? 'opacity-50' 
                          : 'opacity-100'
                      }`}
                      onMouseEnter={() => !previewMode && setHoveredSectionId(section.id)}
                      onMouseLeave={() => !previewMode && setHoveredSectionId(null)}
                      onClick={() => !previewMode && activeEditField === null && setSelectedSectionId(section.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedSectionIndex !== null) {
                          setDragOverSection(true);
                        }
                      }}
                      onDragLeave={() => {
                        setDragOverSection(false);
                      }}
                    >
                      {/* Section settings button - only visible when hovered or selected */}
                      
                      {/* Section selection outline - only visible when hovered or selected in edit mode */}
                      
                      <EditModeProvider 
                        initialEditMode={!previewMode} 
                        onContentUpdate={(fieldName, value) => handleContentUpdate(section.id, fieldName, value)}
                        isMobilePreview={mobileView}
                      >
                      {renderSection(section)}
                      </EditModeProvider>
                    </div>
                    
                    {/* Drop zone below this section - Updated styling */}
                    {!previewMode && (
                      <div 
                        className={`h-12 w-full flex items-center justify-center transition-all ${
                          dropTargetIndex === originalIndex + 1
                            ? 'bg-primary-pink/10 border-2 border-primary-pink border-dashed'
                            : 'bg-gray-100 border-2 border-gray-300 border-dashed'
                        }`}
                        onDragOver={(e) => handleDragOver(originalIndex + 1, e)}
                        onDrop={(e) => handleDrop(originalIndex + 1, e)}
                        onDragLeave={() => setDropTargetIndex(null)}
                      >
                        <div className="text-xs text-gray-500">
                          {dropTargetIndex === originalIndex + 1
                            ? 'Drop to add section here'
                            : 'Drag sections here'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                      ); // End of return statement
                    }) // End of map function
                    .filter(Boolean)} {/* Remove null values from global sections */}
                </div>
              )}
            
            {/* Global Footer */}
            {globalFooterSection && (
              <div className="relative">
                {!previewMode && (
                  <div className="absolute -left-10 top-4 flex flex-col items-center space-y-1 z-10">
                    {/* Settings button for global footer */}
                    <button 
                      onClick={() => openSectionSettings(globalFooterSection.id)}
                      className="p-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900"
                      title="Global footer settings"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    {/* Delete button for global footer */}
                    <button 
                      onClick={async () => {
                        // Delete the global footer section completely
                        if (selectedProject && selectedProject.global_footer_section_id) {
                          try {
                            console.log('🗑️ Deleting global footer section');
                            
                            // First, clear the global footer reference
                            const { error: updateError } = await supabase
                              .from('projects')
                              .update({ global_footer_section_id: null })
                              .eq('id', selectedProject.id);
                              
                            if (updateError) {
                              console.error('Error clearing global footer reference:', updateError);
                              return;
                            }
                            
                            // Then delete the page_sections record
                            const { error: deleteError } = await supabase
                              .from('page_sections')
                              .delete()
                              .eq('id', selectedProject.global_footer_section_id);
                              
                            if (deleteError) {
                              console.error('Error deleting page_sections record:', deleteError);
                            }
                            
                            // Update local state
                            setGlobalFooterSection(null);
                            await refetchProject();
                            setHasChanges(true);
                            
                            console.log('✅ Global footer deleted successfully');
                          } catch (error) {
                            console.error('Error deleting global footer:', error);
                          }
                        }
                      }}
                      className="p-1 rounded-full bg-white border border-gray-200 shadow-sm text-red-500 hover:text-red-700"
                      title="Delete global footer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <EditModeProvider 
                  initialEditMode={!previewMode} 
                  onContentUpdate={(fieldName, value) => {
                    // Update global footer content
                    const updatedSection = {
                      ...globalFooterSection,
                      content: {
                        ...globalFooterSection.content,
                        [fieldName]: value
                      }
                    };
                    setGlobalFooterSection(updatedSection);
                    setHasChanges(true);
                  }}
                  isMobilePreview={mobileView}
                >
                  {renderSection(globalFooterSection)}
                </EditModeProvider>
              </div>
            )}
            
            {activeEditField && (
              <div className="fixed inset-0 z-50 pointer-events-none">
                {/* Invisible overlay to help with tooltip positioning */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </CSSSiteStylesProvider>
  );
};

export default PageBuilderPage;