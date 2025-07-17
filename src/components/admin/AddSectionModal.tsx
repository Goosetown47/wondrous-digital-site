import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import SectionImageUpload from './SectionImageUpload';
import { useSectionTypes } from '../../hooks/useSectionTypes';
import { useSectionCategories } from '../../hooks/useSectionCategories';

interface SectionTemplate {
  id: string;
  section_type: string;
  template_name: string;
  source_file_name?: string | null;
  component_code: string | null;
  preview_image_url: string | null;
  customizable_fields: Record<string, unknown> | null;
  category: string | null;
  status: 'active' | 'inactive' | 'testing';
}

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingTemplate: SectionTemplate | null;
  sourceFileNameFromStaging?: string; // New prop for the original file name
}


const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTemplate,
  sourceFileNameFromStaging
}) => {
  // Get dynamic data from hooks
  const { sectionTypes, loading: typesLoading } = useSectionTypes();
  const { categories, loading: categoriesLoading } = useSectionCategories();
  
  // Form state
  const [section, setSection] = useState<{
    section_type: string;
    template_name: string;
    component_code: string;
    preview_image_url: string;
    customizable_fields: string;
    category: string;
    status: 'active' | 'inactive' | 'testing';
  }>({
    section_type: '',
    template_name: '',
    component_code: '',
    preview_image_url: '',
    customizable_fields: '{}',
    category: '',
    status: 'testing'
  });
  
  // Form validation and submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Initialize form with editing template data if provided
  useEffect(() => {
    if (editingTemplate) {
      setSection({
        section_type: editingTemplate.section_type || '',
        template_name: editingTemplate.template_name || '',
        component_code: editingTemplate.component_code || '',
        preview_image_url: editingTemplate.preview_image_url || '',
        status: editingTemplate.status || 'testing',
        customizable_fields: editingTemplate.customizable_fields ? 
          JSON.stringify(editingTemplate.customizable_fields, null, 2) : 
          '{}',
        category: editingTemplate.category || ''
      });
    } else {
      // Reset form for new template with first available type and category
      setSection({
        section_type: sectionTypes.length > 0 ? sectionTypes[0].type_key : '',
        template_name: '',
        component_code: '',
        preview_image_url: '',
        customizable_fields: '{}',
        category: categories.length > 0 ? categories[0].category_key : '',
        status: 'testing'
      });
    }
    
    // Reset errors
    setError(null);
    setFormErrors({});
  }, [editingTemplate, isOpen, sectionTypes, categories]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSection(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!section.template_name.trim()) {
      newErrors.template_name = 'Template name is required';
    }
    
    if (!section.component_code.trim()) {
      newErrors.component_code = 'Component code is required';
    }
    
    try {
      if (section.customizable_fields.trim() !== '') {
        JSON.parse(section.customizable_fields);
      }
    } catch {
      newErrors.customizable_fields = 'Invalid JSON format';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Parse customizable_fields as JSON
      let customizableFields;
      try {
        customizableFields = JSON.parse(section.customizable_fields);
      } catch {
        customizableFields = {};
      }
      
      // Prepare data for Supabase
      const sectionData = {
        section_type: section.section_type,
        template_name: section.template_name.trim(), // Trim to ensure no leading/trailing whitespace
        component_code: section.component_code,
        status: section.status,
        preview_image_url: section.preview_image_url || null,
        customizable_fields: customizableFields,
        category: section.category,
        // Preserve original source_file_name when editing existing template
        source_file_name: sourceFileNameFromStaging || 
          (editingTemplate && editingTemplate.source_file_name) || 
          null
      };
      
      if (editingTemplate && editingTemplate.id !== '') {
        // Update existing template
        const { error: updateError } = await supabase
          .from('section_templates')
          .update(sectionData)
          .eq('id', editingTemplate.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new template
        const { error: insertError } = await supabase
          .from('section_templates')
          .insert([sectionData]);
          
        if (insertError) throw insertError;
      }
      
      // Call onSave callback to refresh the section library
      onSave();
    } catch (err: unknown) {
      console.error('Error saving section template:', err);
      setError(err instanceof Error ? err.message : 'Failed to save section template');
    } finally {
      setLoading(false);
    }
  };
  
  // Prevent click events on the modal content from closing the modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTemplate ? 'Edit Section Template' : 'Add New Section Template'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Template Name */}
              <div>
                <label htmlFor="template_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="template_name"
                  name="template_name"
                  value={section.template_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink ${
                    formErrors.template_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="E.g., Modern Hero Section"
                />
                {formErrors.template_name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.template_name}</p>
                )}
              </div>
              
              {/* Section Type */}
              <div>
                <label htmlFor="section_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Section Type <span className="text-red-500">*</span>
                </label>
                {typesLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <select
                    id="section_type"
                    name="section_type"
                    value={section.section_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                  >
                    {sectionTypes.map(type => (
                      <option key={type.id} value={type.type_key}>
                        {type.display_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <select
                    id="category"
                    name="category"
                    value={section.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.category_key}>
                        {category.display_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={section.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                >
                  <option value="testing">Testing</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Section status (testing for development, active for production use)
                </p>
              </div>
              
              {/* Preview Image URL */}
              <div>
                <label htmlFor="preview_image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Preview Image
                </label>
                <SectionImageUpload 
                  currentImageUrl={section.preview_image_url || ''}
                  onImageUploaded={(url) => setSection(prev => ({ ...prev, preview_image_url: url }))}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Upload an image to show how this section will appear.
                </p>
              </div>
              
              {/* Customizable Fields */}
              <div>
                <label htmlFor="customizable_fields" className="block text-sm font-medium text-gray-700 mb-1">
                  Customizable Fields (JSON)
                </label>
                <textarea
                  id="customizable_fields"
                  name="customizable_fields"
                  value={section.customizable_fields}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink font-mono text-sm ${
                    formErrors.customizable_fields ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='{ "title": { "type": "text", "default": "Section Title" } }'
                />
                {formErrors.customizable_fields ? (
                  <p className="mt-1 text-sm text-red-600">{formErrors.customizable_fields}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Define customizable fields in JSON format. Example:<br />
                    {`{ "title": { "type": "text", "default": "Section Title" } }`}
                  </p>
                )}
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              {/* Component Code */}
              <div className="h-full">
                <label htmlFor="component_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Component Code (JSX) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="component_code"
                  name="component_code"
                  value={section.component_code}
                  onChange={handleChange}
                  rows={20}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink font-mono text-sm ${
                    formErrors.component_code ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="const MyComponent = ({title}) => {\n  return (\n    <div>\n      <h2>{title}</h2>\n    </div>\n  );\n};"
                />
                {formErrors.component_code && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.component_code}</p>
                )}
              </div>
            </div>
          </div>
        </form>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-primary-dark-purple transition-colors duration-200 flex items-center ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {editingTemplate ? 'Update Section' : 'Save Section'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSectionModal;