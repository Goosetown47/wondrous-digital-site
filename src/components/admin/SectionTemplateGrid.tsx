import React, { useState, useEffect, useCallback } from 'react';
import { Check, Plus } from 'lucide-react';
import { supabase } from '../../utils/supabase';

// Define the type for a section template from the database
interface SectionTemplate {
  id: string;
  section_type: string;
  template_name: string;
  preview_image_url: string | null;
  customizable_fields: Record<string, unknown>;
  category: string | null;
  status: 'active' | 'inactive' | 'testing';
}

interface SectionTemplateGridProps {
  sectionType: string;
  currentTemplateId?: string;
  onTemplateSelect: (template: SectionTemplate) => void;
  className?: string;
}

const SectionTemplateGrid: React.FC<SectionTemplateGridProps> = ({
  sectionType,
  currentTemplateId,
  onTemplateSelect,
  className = ''
}) => {
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(currentTemplateId || null);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplatesForType = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('section_templates')
        .select('*')
        .eq('section_type', sectionType)
        .eq('status', 'active')
        .order('template_name');
        
      if (error) throw error;
      
      setTemplates(data || []);
      
      // Set the first template as default if no current template is specified
      if (data && data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (err: unknown) {
      console.error('Error fetching templates for type:', sectionType, err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [sectionType]);

  // Fetch templates for the specific section type
  useEffect(() => {
    fetchTemplatesForType();
  }, [fetchTemplatesForType]);

  const handleTemplateSelect = (template: SectionTemplate) => {
    setSelectedTemplateId(template.id);
    onTemplateSelect(template);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-32 ${className}`}>
        <div className="text-sm text-gray-500">Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-32 ${className}`}>
        <div className="text-sm text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-32 ${className}`}>
        <Plus className="h-8 w-8 text-gray-400 mb-2" />
        <div className="text-sm text-gray-500">No active templates available</div>
        <div className="text-xs text-gray-400">for {sectionType} sections</div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {templates.map((template, index) => {
          const isSelected = selectedTemplateId === template.id;
          const isDefault = index === 0;
          
          return (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`
                relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-pink-500 ring-2 ring-pink-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {/* Preview Image */}
              <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                {template.preview_image_url ? (
                  <img 
                    src={template.preview_image_url} 
                    alt={template.template_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Plus className="h-6 w-6" />
                  </div>
                )}
                
                {/* Selection Overlay */}
                <div className={`
                  absolute inset-0 transition-all duration-200
                  ${isSelected 
                    ? 'bg-pink-500 bg-opacity-10' 
                    : 'bg-black bg-opacity-0 group-hover:bg-opacity-5'
                  }
                `} />
                
                {/* Check Mark for Selected */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                
                {/* Default Badge */}
                {isDefault && !isSelected && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900 bg-opacity-75 rounded text-xs text-white">
                    Default
                  </div>
                )}
              </div>
              
              {/* Template Name */}
              <div className="p-2 bg-white">
                <div className={`
                  text-xs font-medium text-center truncate transition-colors duration-200
                  ${isSelected ? 'text-pink-700' : 'text-gray-900'}
                `}>
                  {template.template_name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Select a template to change your section design
      </div>
    </div>
  );
};

export default SectionTemplateGrid;
export type { SectionTemplateGridProps };