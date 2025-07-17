import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { PlusCircle, FileCode, Clock, ArrowRight, X, Loader, LampDesk as Desktop, Smartphone, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HeroSplitLayout from '../../components/sections/HeroSplitLayout';
import FourFeaturesGrid from '../../components/sections/FourFeaturesGrid';
import NavigationDesktop from '../../components/sections/NavigationDesktop';
import AddSectionModal from '../../components/admin/AddSectionModal';
import { EditModeProvider } from '../../contexts/EditModeContext';

interface FileInfo {
  name: string;
  path: string;
  lastModified: string;
  component: React.ComponentType<any>;
}

// This is a mock function since we can't actually scan the file system from the browser
// In a real implementation, this would be handled by a server-side function
const scanSectionsFolder = async (): Promise<FileInfo[]> => {
  // In a real implementation, we would scan the actual file system for all section components
  // For this demo, we're mocking the available components

  return [{
    name: 'HeroSplitLayout',
    path: '/src/components/sections/HeroSplitLayout.tsx',
    lastModified: new Date().toISOString(),
    component: HeroSplitLayout
  },
  {
    name: 'FourFeaturesGrid',
    path: '/src/components/sections/FourFeaturesGrid.tsx',
    lastModified: new Date().toISOString(),
    component: FourFeaturesGrid
  },
  {
    name: 'NavigationDesktop',
    path: '/src/components/sections/NavigationDesktop.tsx',
    lastModified: new Date().toISOString(),
    component: NavigationDesktop
  }];
};

interface SectionTemplate {
  id?: string;
  section_type: string;
  template_name: string;
  source_file_name?: string | null;
  component_code: string | null;
  preview_image_url: string | null;
  customizable_fields: any | null;
  category: string | null;
  status: 'active' | 'inactive' | 'testing';
}

const StagingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stagingSections, setStagingSections] = useState<FileInfo[]>([]);
  const [dbSections, setDbSections] = useState<string[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<FileInfo | null>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Fetch all sections on component mount
  useEffect(() => {
    fetchSections();
  }, []);
  
  // Function to fetch sections from both file system and database
  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get database sections
      const { data: dbData, error: dbError } = await supabase
        .from('section_templates')
        .select('template_name, source_file_name');
      
      if (dbError) throw dbError;
      
      // Extract section names and source file names for comparison
      // For each section, check both template_name and source_file_name
      const dbSectionNames = dbData?.map(s => {
        // If source_file_name exists, use that for comparison
        // Otherwise fall back to template_name
        return (s.source_file_name || s.template_name).toLowerCase();
      }) || [];
      
      setDbSections(dbSectionNames);
      
      // Get file system sections
      const fsData = await scanSectionsFolder();
      
      // Filter out sections that are already in the database
      const stagingSections = fsData.filter(section => 
        !dbSectionNames.includes(section.name.toLowerCase())
      );
      
      setStagingSections(stagingSections);
    } catch (err: any) {
      console.error('Error fetching sections:', err);
      setError(err.message || 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle publishing a section to the library
  const handlePublish = (section: FileInfo) => {
    setSelectedSection(section);
    setIsAddModalOpen(true);
  };
  
  // Format component name to a more readable form
  const formatComponentName = (name: string): string => {
    return name.replace(/([A-Z])/g, ' $1').trim();
  };
  
  // Get the current section to preview
  const currentSection = stagingSections[currentSectionIndex];
  
  // Navigate to previous section
  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };
  
  // Navigate to next section
  const nextSection = () => {
    if (currentSectionIndex < stagingSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };
  
  // Render the current section component
  const renderSectionComponent = () => {
    if (!currentSection) return null;
    
    const Component = currentSection.component; 
    
    // This would need to be adapted based on the actual component props
    const componentProps = {
      content: {
        headline: {
          text: "Medium length hero headline goes here",
          color: "#000000"
        },
        description: {
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
          color: "#6B7280"
        },
        primaryButton: {
          text: "Primary Button",
          href: "#",
          variant: "primary"
        },
        secondaryButton: {
          text: "Secondary Button",
          href: "#",
          variant: "outline"
        },
        heroImage: {
          src: "",
          alt: "Hero image"
        },
        backgroundColor: "#FFFFFF"
      }
    };
    
    // Add component-specific props based on section type
    if (currentSection.name === 'NavigationDesktop') {
      componentProps.content = {
        logo: {
          type: 'text',
          text: 'Logo',
          href: '/'
        },
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        ctaButton1: {
          text: 'Button',
          href: '#',
          variant: 'secondary'
        },
        ctaButton2: {
          text: 'Button',
          href: '#',
          variant: 'primary'
        }
      };
    } else if (currentSection.name === 'FourFeaturesGrid') {
      componentProps.content = {
        tagline: {
          text: "Tagline",
          color: "#000000"
        },
        mainHeading: {
          text: "Medium length section heading goes here",
          color: "#000000"
        },
        description: {
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
          color: "#6B7280"
        },
        feature1Icon: {
          icon: "Box",
          size: 40,
          color: "#000000"
        },
        feature1Heading: {
          text: "Medium length section heading goes here",
          color: "#000000"
        },
        feature1Description: {
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
          color: "#6B7280"
        },
        feature2Icon: {
          icon: "Box",
          size: 40,
          color: "#000000"
        },
        feature2Heading: {
          text: "Medium length section heading goes here",
          color: "#000000"
        },
        feature2Description: {
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
          color: "#6B7280"
        },
        feature3Icon: {
          icon: "Box",
          size: 40,
          color: "#000000"
        },
        feature3Heading: {
          text: "Medium length section heading goes here",
          color: "#000000"
        },
        feature3Description: {
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
          color: "#6B7280"
        },
        feature4Icon: {
          icon: "Box",
          size: 40,
          color: "#000000"
        },
        feature4Heading: {
          text: "Medium length section heading goes here",
          color: "#000000"
        },
        feature4Description: {
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
          color: "#6B7280"
        },
        primaryButton: {
          text: "Button",
          href: "#",
          variant: "outline"
        },
        secondaryButton: {
          text: "Button",
          href: "#",
          variant: "secondary"
        },
        backgroundColor: "#FFFFFF"
      };
    }
    
    return (
      <EditModeProvider 
        initialEditMode={false}
        isMobilePreview={viewportMode === 'mobile'}
      >
        <Component 
          content={componentProps.content}
          isMobilePreview={viewportMode === 'mobile'} 
        />
      </EditModeProvider>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 text-primary-pink animate-spin mr-2" />
        <span className="text-gray-600">Scanning for unpublished sections...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchSections}
          className="mt-2 text-sm font-medium underline"
        >
          Try again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Staging</h1>
          <p className="text-gray-600">
            Manage unpublished sections before adding to library
          </p>
          {stagingSections.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              Found {stagingSections.length} unpublished section{stagingSections.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <Link
          to="/dashboard/admin/section-library"
          className="text-primary-pink hover:text-primary-dark-purple transition-colors"
        >
          <div className="flex items-center">
            <span>Section Library</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Link>
      </div>
      
      {/* No sections state */}
      {stagingSections.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
            <FileCode className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No unpublished sections found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            All section components in your codebase have been published to the section library.
          </p>
          <p className="text-sm text-gray-500">
            To create new sections, add component files to <code className="bg-gray-100 px-2 py-1 rounded">src/components/sections/</code>
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          {/* Preview Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-4 font-medium text-gray-700">
                {currentSectionIndex + 1} of {stagingSections.length}: {formatComponentName(currentSection.name)}
              </span>
              <span className="text-xs text-gray-500 hidden md:inline-block">
                <Clock className="inline-block h-3 w-3 mr-1" />
                Last modified: {new Date(currentSection.lastModified).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Viewport toggle */}
              <div className="bg-gray-200 rounded-full p-1 flex items-center">
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1 rounded-full ${viewportMode === 'desktop' ? 'bg-white text-primary-pink shadow-sm' : 'text-gray-500'}`}
                  title="Desktop view"
                >
                  <Desktop className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1 rounded-full ${viewportMode === 'mobile' ? 'bg-white text-primary-pink shadow-sm' : 'text-gray-500'}`}
                  title="Mobile view"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
              
              {/* Publish button */}
              <button
                onClick={() => handlePublish(currentSection)}
                className="px-3 py-1.5 bg-primary-pink text-white text-sm rounded hover:bg-primary-dark-purple transition-colors flex items-center"
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Loader className="animate-spin h-3 w-3 mr-1" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Publish to Library
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Section Navigation - only show if more than one section */}
          {stagingSections.length > 1 && (
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <button
                onClick={prevSection}
                disabled={currentSectionIndex === 0}
                className={`px-2 py-1 rounded text-sm flex items-center ${currentSectionIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <ArrowRight className="h-3 w-3 mr-1 transform rotate-180" />
                Previous
              </button>
              
              <div className="text-sm text-gray-500">
                {currentSectionIndex + 1} / {stagingSections.length}
              </div>
              
              <button
                onClick={nextSection}
                disabled={currentSectionIndex === stagingSections.length - 1}
                className={`px-2 py-1 rounded text-sm flex items-center ${currentSectionIndex === stagingSections.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Next
                <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {/* Section Preview */}
          <div className={`overflow-hidden transition-all duration-300 bg-gray-100 ${viewportMode === 'mobile' ? 'flex justify-center py-8' : ''}`}>
            <div className={`transition-all duration-300 ${viewportMode === 'mobile' ? 'w-[375px] border-x border-gray-300 shadow-lg' : 'w-full'}`}>
              {renderSectionComponent()}
            </div>
          </div>
          
          {/* Section Details */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Component Details</h3>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Name:</strong> {currentSection.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Path:</strong> {currentSection.path}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Last modified:</strong> {new Date(currentSection.lastModified).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Publishing Info</h3>
                <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-600">
                  <p className="mb-2">
                    When you publish this section, the component code will be extracted and added to the section library for reuse.
                  </p>
                  <p>
                    The default status will be set to "testing" so you can review it before making it active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedSection(null);
        }}
        onSave={() => {
          setIsAddModalOpen(false);
          setSelectedSection(null);
          // Refresh the sections list
          fetchSections();
        }}
        editingTemplate={{
          id: '',
          section_type: selectedSection?.name === 'NavigationDesktop' ? 'navigation' : 'hero',
          template_name: selectedSection ? formatComponentName(selectedSection.name) : '',
          component_code: `import React from 'react';\n\nconst ${selectedSection?.name} = () => {\n  return <div>Component code will be extracted here</div>;\n};\n\nexport default ${selectedSection?.name};`,
          preview_image_url: null,
          customizable_fields: null,
          category: 'Basic',
          status: 'testing'
        } as any}
        sourceFileNameFromStaging={selectedSection?.name} // Pass the original file name
      />
    </div>
  );
};

export default StagingPage;