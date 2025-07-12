import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { ArrowLeft, Loader } from 'lucide-react';
import HeroSplitLayout from '../../components/sections/HeroSplitLayout';
import FourFeaturesGrid from '../../components/sections/FourFeaturesGrid';
import { EditModeProvider } from '../../contexts/EditModeContext';

interface SectionTemplate {
  id: string;
  section_type: string;
  template_name: string;
  component_code: string | null;
  preview_image_url: string | null;
  customizable_fields: any | null;
  category: string | null;
  status: 'active' | 'inactive' | 'testing';
  created_at: string | null;
  updated_at: string | null;
}

const SectionPreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [section, setSection] = useState<SectionTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSectionTemplate();
  }, [id]);

  const fetchSectionTemplate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('section_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSection(data);
      
      // Initialize section content from customizable_fields if available
      if (data.customizable_fields) {
        const initialContent = {};
        
        // Extract default values from customizable_fields
        Object.entries(data.customizable_fields).forEach(([field, config]) => {
          // @ts-ignore
          initialContent[field] = config.default;
        });
        
        setSectionContent(initialContent);
      }
    } catch (err: any) {
      console.error('Error fetching section template:', err);
      setError(err.message || 'Failed to load section template');
    } finally {
      setLoading(false);
    }
  };

  // Render section component based on section type
  const renderSectionComponent = () => {
    if (!section) return null;

    switch (section.section_type) {
      case 'hero':
        return (
          <EditModeProvider 
            initialEditMode={editMode}
            onContentUpdate={(fieldName, value) => {
              // Update the content object with the new value
              setSectionContent(prev => ({
                ...prev,
                [fieldName]: value
              }));
            }}
          >
            <HeroSplitLayout
              content={{
                headline: sectionContent?.headline?.text || "Medium length hero headline goes here",
                description: sectionContent?.description?.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
                primaryButtonText: sectionContent?.primaryButton?.text || "Primary Button",
                secondaryButtonText: sectionContent?.secondaryButton?.text || "Secondary Button"
              }}
              styling={{
                headlineColor: sectionContent?.headline?.color,
                descriptionColor: sectionContent?.description?.color,
                backgroundColor: '#FFFFFF'
              }}
              images={{
                heroImage: sectionContent?.heroImage?.src
              }}
              links={{ 
                primaryButtonLink: sectionContent?.primaryButton?.href || "#", 
                secondaryButtonLink: sectionContent?.secondaryButton?.href || "#" 
              }}
              isMobilePreview={false}
              editMode={editMode}
            />
          </EditModeProvider>
        );
      case 'features':
        return (
          <EditModeProvider 
            initialEditMode={editMode}
            onContentUpdate={(fieldName, value) => {
              // Update the content object with the new value
              setSectionContent(prev => ({
                ...prev,
                [fieldName]: value
              }));
            }}
          >
            <FourFeaturesGrid
              content={{
                tagline: sectionContent?.tagline || {
                  text: "Tagline",
                  color: "#000000"
                },
                mainHeading: sectionContent?.mainHeading || {
                  text: "Medium length section heading goes here",
                  color: "#000000"
                },
                description: sectionContent?.description || {
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                  color: "#6B7280"
                },
                feature1Icon: sectionContent?.feature1Icon || {
                  icon: "Box",
                  size: 40,
                  color: "#000000"
                },
                feature1Heading: sectionContent?.feature1Heading || {
                  text: "Medium length section heading goes here",
                  color: "#000000"
                },
                feature1Description: sectionContent?.feature1Description || {
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                  color: "#6B7280"
                },
                feature2Icon: sectionContent?.feature2Icon || {
                  icon: "Box",
                  size: 40,
                  color: "#000000"
                },
                feature2Heading: sectionContent?.feature2Heading || {
                  text: "Medium length section heading goes here",
                  color: "#000000"
                },
                feature2Description: sectionContent?.feature2Description || {
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                  color: "#6B7280"
                },
                feature3Icon: sectionContent?.feature3Icon || {
                  icon: "Box",
                  size: 40,
                  color: "#000000"
                },
                feature3Heading: sectionContent?.feature3Heading || {
                  text: "Medium length section heading goes here",
                  color: "#000000"
                },
                feature3Description: sectionContent?.feature3Description || {
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                  color: "#6B7280"
                },
                feature4Icon: sectionContent?.feature4Icon || {
                  icon: "Box",
                  size: 40,
                  color: "#000000"
                },
                feature4Heading: sectionContent?.feature4Heading || {
                  text: "Medium length section heading goes here",
                  color: "#000000"
                },
                feature4Description: sectionContent?.feature4Description || {
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
                  color: "#6B7280"
                },
                primaryButton: sectionContent?.primaryButton || {
                  text: "Button",
                  href: "#",
                  variant: "outline"
                },
                secondaryButton: sectionContent?.secondaryButton || {
                  text: "Button",
                  href: "#",
                  variant: "secondary"
                },
                backgroundColor: sectionContent?.backgroundColor || "#FFFFFF"
              }}
              isMobilePreview={false}
            />
          </EditModeProvider>
        );
      default:
        return (
          <div className="p-12 bg-gray-100 text-center">
            <p className="text-gray-500">No preview available for {section.section_type} type</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 text-primary-pink animate-spin mr-2" />
        <span className="text-gray-600">Loading section preview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchSectionTemplate}
          className="mt-2 text-sm font-medium underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="bg-white p-6 shadow-sm rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Section Preview</h1>
        <p className="text-gray-600">Section not found or has been deleted.</p>
        <button
          onClick={() => navigate('/dashboard/admin/section-library')}
          className="mt-4 text-primary-pink hover:underline flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Section Library
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{section.template_name}</h1>
          <p className="text-gray-600 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              section.status === 'active' ? 'bg-green-500' : 
              section.status === 'testing' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></span>
            {section.status.charAt(0).toUpperCase() + section.status.slice(1)} {section.section_type} section
            {section.category && <span className="ml-2 text-gray-400">• {section.category}</span>}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/admin/section-library')}
          className="text-primary-pink hover:underline flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Section Library
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-700">Preview</h3>
            <div className="flex items-center">
              <label className="inline-flex items-center mr-4 cursor-pointer">
                <span className="mr-2 text-sm text-gray-600">Edit Mode</span>
                <div className="relative">
                  <input 
                    type="checkbox"
                    className="sr-only"
                    checked={editMode}
                    onChange={() => setEditMode(!editMode)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${editMode ? 'bg-primary-pink' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${editMode ? 'translate-x-4 bg-white' : 'bg-white'}`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div>
          {renderSectionComponent()}
        </div>
      </div>

      {/* Section Details */}
      {editMode && sectionContent && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="font-medium text-gray-700">Current Edits</h3>
          </div>
          <div className="p-6">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm text-gray-700">
              {JSON.stringify(sectionContent, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="font-medium text-gray-700">Section Details</h3>
        </div>
        <div className="p-6">
          {section.customizable_fields && Object.keys(section.customizable_fields).length > 0 ? (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customizable Fields</h4>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm text-gray-700">
                {JSON.stringify(section.customizable_fields, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">No customizable fields defined</p>
          )}
        </div>
      </div>

      {/* Component Code */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="font-medium text-gray-700">Component Code</h3>
        </div>
        <div className="p-6">
          {section.component_code ? (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm text-gray-700 max-h-[400px]">
              {section.component_code}
            </pre>
          ) : (
            <p className="text-gray-500">No component code available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionPreviewPage;