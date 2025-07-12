import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../utils/supabase';
import { useProject } from '../../../contexts/ProjectContext';
import { EditModeProvider, useEditMode } from '../../../contexts/EditModeContext';
import { SiteStylesProvider } from '../../../contexts/SiteStylesContext';
import { ArrowLeft, ArrowRight, Save, Eye, EyeOff, Smartphone, PanelTop, Loader, GripVertical, ChevronDown, ChevronUp, Trash2, Search, Plus, X, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import HeroSplitLayout from '../../../components/sections/HeroSplitLayout';
import FourFeaturesGrid from '../../../components/sections/FourFeaturesGrid';
import SectionSettingsModal from '../../../components/dashboard/SectionSettingsModal';

// Define the available section categories for organizing templates
const SECTION_CATEGORIES = [
  'Hero',
  'Features', 
  'Content',
  'Testimonials',
  'Contact',
  'Footer',
  'Other'
];

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
  category: string | null;
  status: 'active' | 'inactive' | 'testing';
}

// Group section templates by category
interface GroupedSections {
  [category: string]: SectionTemplate[];
}

const PageBuilderPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { activeEditField } = useEditMode();
  
  // Page data state
  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionTemplates, setSectionTemplates] = useState<SectionTemplate[]>([]);
  const [groupedTemplates, setGroupedTemplates] = useState<GroupedSections>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteColors, setSiteColors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Drag and drop state
  const [draggedSection, setDraggedSection] = useState<SectionTemplate | null>(null);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dragOverSection, setDragOverSection] = useState<boolean>(false);
  
  // Editing state
  const [editingFieldName, setEditingFieldName] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isSectionSettingsModalOpen, setIsSectionSettingsModalOpen] = useState<boolean>(false);
  
  // Auto-save timer
  const autoSaveTimerRef = useRef<number | null>(null);
  
  // Load page data and section templates when component mounts
  useEffect(() => {
    if (pageId && selectedProject) {
      fetchPageData();
      fetchSectionTemplates();
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
  
  // When section templates change, group them by category
  useEffect(() => {
    const grouped: GroupedSections = {};
    
    // First pass - populate with ordered categories
    
    SECTION_CATEGORIES.forEach(type => {
      grouped[type] = [];
    });
    
    // Second pass - add templates to their categories
    sectionTemplates.forEach(template => {
      const category = template.section_type || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    });
    
    // Remove empty categories
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });
    
    setGroupedTemplates(grouped);
    
    // Initialize expanded categories
    if (expandedCategories.length === 0 && Object.keys(grouped).length > 0) {
      setExpandedCategories([Object.keys(grouped)[0]]);
    }
  }, [sectionTemplates]);

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
  
  // Fetch section templates from the database
  const fetchSectionTemplates = async () => {
    try {
      // Only fetch active templates for regular users, admins can see all
      const query = supabase
        .from('section_templates')
        .select('*')
        .order('category')
        .order('template_name');
        
      const { data, error } = await query;
        
      if (error) throw error;
      
      setSectionTemplates(data || []);
    } catch (err: any) {
      console.error('Error fetching section templates:', err);
      // Don't set error state here as this is not critical for page function
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
      
      // Extract color properties from site styles
      if (data) {
        const colorEntries = Object.entries(data)
          .filter(([key, value]) => 
            (key.includes('color') || key.includes('gradient')) && 
            typeof value === 'string' && 
            value.length > 0
          );
          
        const colorObj = Object.fromEntries(colorEntries);
        setSiteColors(colorObj);
      }
    } catch (err) {
      console.error('Error fetching site styles:', err);
      // Non-critical error, don't set error state
    }
  };
  
  // Handle section template drag start
  const handleDragStart = (template: SectionTemplate, event: React.DragEvent) => {
    setDraggedSection(template);
    
    // Set a ghost image for the drag operation
    if (event.dataTransfer) {
      const ghostElement = document.createElement('div');
      ghostElement.classList.add('bg-white', 'p-2', 'rounded', 'shadow');
      ghostElement.textContent = template.template_name;
      document.body.appendChild(ghostElement);
      
      event.dataTransfer.setDragImage(ghostElement, 0, 0);
      event.dataTransfer.effectAllowed = 'move';
      
      // Remove the ghost element after it's no longer needed
      setTimeout(() => {
        document.body.removeChild(ghostElement);
      }, 0);
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
  const handleDrop = (index: number, event: React.DragEvent) => {
    event.preventDefault();
    
    // Reset drag states
    setDropTargetIndex(null);
    
    // Case 1: Adding a new section from the library
    if (draggedSection) {
      // Create a new section based on the template
      const newSection: Section = {
        id: Math.random().toString(36).substr(2, 9), // Generate unique ID
        type: draggedSection.section_type,
        content: draggedSection.customizable_fields || {}
      };
      
      // Insert the new section at the specified index
      const newSections = [...sections];
      newSections.splice(index, 0, newSection);
      
      setSections(newSections);
      setDraggedSection(null);
      setHasChanges(true);
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
    setDraggedSection(null);
    setDraggedSectionIndex(null);
    setDropTargetIndex(null);
    setDragOverSection(false);
  };
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories([]);
    } else {
      // Auto-collapse behavior: When one category opens, others close
      setExpandedCategories([category]);
    }
  };
  
  // Filter section templates based on search term
  const filterTemplates = () => {
    if (!searchTerm) return groupedTemplates;
    
    const filtered: GroupedSections = {};
    
    Object.entries(groupedTemplates).forEach(([category, templates]) => {
      const matchingTemplates = templates.filter(template => 
        template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.section_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchingTemplates.length > 0) {
        filtered[category] = matchingTemplates;
      }
    });
    
    return filtered;
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
  const handleSaveSectionSettings = (sectionId: string, settings: { backgroundColor: string }) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: {
            ...section.content,
            backgroundColor: settings.backgroundColor
          }
        };
      }
      return section;
    });
    
    setSections(updatedSections);
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
  
  // Render a specific section based on its type
  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'hero':
        return (
            <HeroSplitLayout
              content={{
                headline: {
                  text: section.content?.headline?.text || "Medium length hero headline goes here",
                  color: section.content?.headline?.color
                },
                description: {
                  text: section.content?.description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
                  color: section.content?.description?.color
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
                  alt: section.content?.heroImage?.alt || "Hero image"
                },
                backgroundColor: section.content?.backgroundColor || "#FFFFFF"
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
                color: section.content?.tagline?.color
              },
              mainHeading: {
                text: section.content?.mainHeading?.text || "Medium length section heading goes here",
                color: section.content?.mainHeading?.color
              },
              description: {
                text: section.content?.description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                color: section.content?.description?.color
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
                color: section.content?.feature1Heading?.color
              },
              feature1Description: {
                text: section.content?.feature1Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                color: section.content?.feature1Description?.color
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
                color: section.content?.feature2Heading?.color
              },
              feature2Description: {
                text: section.content?.feature2Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                color: section.content?.feature2Description?.color
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
                color: section.content?.feature3Heading?.color
              },
              feature3Description: {
                text: section.content?.feature3Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                color: section.content?.feature3Description?.color
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
                color: section.content?.feature4Heading?.color
              },
              feature4Description: {
                text: section.content?.feature4Description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                color: section.content?.feature4Description?.color
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
              backgroundColor: section.content?.backgroundColor || "#FFFFFF"
            }}
            isMobilePreview={mobileView}
          />
        );
      default:
        return (
          <div className="p-12 bg-gray-100 text-center">
            <p className="text-gray-500">Unknown section type: {section.type}</p>
          </div>
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader className="h-6 w-6 text-primary-pink animate-spin mr-3" />
        <span className="text-lg text-gray-600">Loading page builder...</span>
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
  
  const filteredTemplates = filterTemplates();
  
  return (
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
        <div className={`${sidebarOpen ? 'w-[300px]' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col z-10 flex-shrink-0 h-full`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Section Library</h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
        
        {/* Section Settings Modal */}
        {selectedSectionId && (
          <SectionSettingsModal
            isOpen={isSectionSettingsModalOpen}
            onClose={() => setIsSectionSettingsModalOpen(false)}
            sectionId={selectedSectionId}
            initialBgColor={sections.find(s => s.id === selectedSectionId)?.content?.backgroundColor || '#FFFFFF'}
            onSave={handleSaveSectionSettings}
            siteColors={siteColors}
          />
        )}
          <div className="overflow-y-auto flex-grow grid grid-cols-2 gap-3 p-4">
            {Object.keys(filteredTemplates).length === 0 ? (
              <div className="col-span-2 text-center py-6 text-gray-500">
                {searchTerm ? (
                  <p>No matching sections found. Try a different search term.</p>
                ) : (
                  <p>No sections available. Add sections to your library.</p>
                )}
              </div>
            ) : (
              <div className="col-span-2 space-y-2">
                {Object.entries(filteredTemplates).map(([category, templates]) => (
                  <div key={category} className="overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex justify-between items-center text-left hover:text-primary-pink transition-colors duration-200"
                    >
                      <span className="font-medium text-gray-700 py-2">{category}</span>
                      {expandedCategories.includes(category) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    
                    {expandedCategories.includes(category) && (
                      <div className="grid grid-cols-2 gap-2">
                        {templates.map(template => (
                          <div
                            key={template.id}
                            className="group bg-white rounded border border-gray-200 hover:shadow-sm cursor-grab overflow-hidden transition-all duration-200"
                            draggable
                            onDragStart={(e) => handleDragStart(template, e)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="relative w-full aspect-video bg-gray-100 overflow-hidden group-hover:ring-2 group-hover:ring-primary-pink">
                              {template.preview_image_url ? (
                                <img src={template.preview_image_url} alt={template.template_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Plus className="h-4 w-4" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
                              <GripVertical className="absolute top-1 right-1 h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
                            </div>
                            <div className="py-1 px-2 text-center">
                              <div className="text-xs font-medium text-gray-900 truncate">{template.template_name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Page Canvas with Sections - Full height, centered content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col items-center h-full">
          <div className="bg-white mx-auto my-8" style={{
            maxWidth: mobileView ? '375px' : '1200px', 
            width: mobileView ? '375px' : '100%',
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.08)'
          }}>
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
                    {dropTargetIndex === 0 && draggedSection 
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
                sections.map((section, index) => (
                  <div key={section.id} className="relative">
                    {!previewMode && (
                      <div className="absolute -left-10 top-4 flex flex-col items-center space-y-1 z-10">
                        <button 
                          onClick={() => moveSection(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded-full bg-white border border-gray-200 shadow-sm ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <div 
                          className="p-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 cursor-grab"
                          draggable
                          onDragStart={(e) => handleSectionDragStart(index, e)}
                          onDragEnd={handleDragEnd}
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <button 
                          onClick={() => moveSection(index, 'down')}
                          disabled={index === sections.length - 1}
                          className={`p-1 rounded-full bg-white border border-gray-200 shadow-sm ${index === sections.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
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
                          onClick={() => removeSection(index)}
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
                        !previewMode && dragOverSection && draggedSectionIndex === index 
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
                      
                      <SiteStylesProvider>
                      <EditModeProvider 
                        initialEditMode={!previewMode} 
                        onContentUpdate={(fieldName, value) => handleContentUpdate(section.id, fieldName, value)}
                        isMobilePreview={mobileView}
                      >
                      {renderSection(section)}
                      </EditModeProvider>
                      </SiteStylesProvider>
                    </div>
                    
                    {/* Drop zone below this section - Updated styling */}
                    {!previewMode && (
                      <div 
                        className={`h-12 w-full flex items-center justify-center transition-all ${
                          dropTargetIndex === index + 1
                            ? 'bg-primary-pink/10 border-2 border-primary-pink border-dashed'
                            : 'bg-gray-100 border-2 border-gray-300 border-dashed'
                        }`}
                        onDragOver={(e) => handleDragOver(index + 1, e)}
                        onDrop={(e) => handleDrop(index + 1, e)}
                        onDragLeave={() => setDropTargetIndex(null)}
                      >
                        <div className="text-xs text-gray-500">
                          {dropTargetIndex === index + 1 && draggedSection 
                            ? 'Drop to add section here'
                            : 'Drag sections here'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ))
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
  );
};

export default PageBuilderPage;