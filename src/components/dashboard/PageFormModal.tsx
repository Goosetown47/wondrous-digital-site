import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface Page {
  id?: string;
  project_id: string;
  page_name: string;
  slug: string;
  page_type?: string | null;
  status: 'draft' | 'published';
  sections?: any[] | null;
  created_at?: string;
  updated_at?: string;
  meta_title?: string;
  meta_description?: string;
  isNew?: boolean;
}

interface PageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (page: Page) => void;
  page: Partial<Page> | null;
  existingPages: Page[];
}

const PAGE_TYPES = [
  'Home', 
  'About', 
  'Services', 
  'Contact', 
  'Blog', 
  'Products',
  'Team',
  'FAQ',
  'Pricing',
  'Gallery',
  'Testimonials',
  'Custom'
];

const PageFormModal: React.FC<PageFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  page,
  existingPages
}) => {
  const [formData, setFormData] = useState<Page>({
    project_id: '',
    page_name: '',
    slug: '',
    page_type: 'Custom',
    status: 'draft',
    sections: [],
    meta_title: '',
    meta_description: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Initialize form data when page changes
  useEffect(() => {
    if (page) {
      setFormData({
        id: page.id,
        project_id: page.project_id || '',
        page_name: page.page_name || '',
        slug: page.slug || '',
        page_type: page.page_type || 'Custom',
        status: page.status || 'draft',
        sections: page.sections || [],
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        isNew: page.isNew
      });
      
      // For existing pages, consider the slug as edited
      setSlugEdited(!!page.id);
    }
  }, [page]);
  
  // Auto-generate slug from page name
  useEffect(() => {
    if (formData.page_name && !slugEdited) {
      const newSlug = formData.page_name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim(); // Remove leading/trailing spaces
      
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
  }, [formData.page_name, slugEdited]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If user edits slug directly, mark it as edited
    if (name === 'slug') {
      setSlugEdited(true);
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.page_name.trim()) {
      newErrors.page_name = 'Page name is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else {
      // Check if slug is valid (only alphanumeric, hyphens)
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
      }
      
      // Check if slug is unique for this project
      const slugExists = existingPages.some(p => 
        p.slug === formData.slug && p.id !== formData.id
      );
      
      if (slugExists) {
        newErrors.slug = 'This URL slug is already in use. Please choose another one.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    onSave(formData);
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
        className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col m-4"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {formData.isNew ? 'Create New Page' : 'Edit Page'}
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
          <div className="space-y-6">
            {/* Page Name */}
            <div>
              <label htmlFor="page_name" className="block text-sm font-medium text-gray-700 mb-1">
                Page Name <span className="text-red-500">*</span>
              </label>
              <input
                id="page_name"
                name="page_name"
                type="text"
                value={formData.page_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink ${
                  errors.page_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Home Page"
              />
              {errors.page_name && (
                <p className="mt-1 text-sm text-red-600">{errors.page_name}</p>
              )}
            </div>
            
            {/* Page Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  /
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={formData.slug}
                  onChange={handleChange}
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg focus:ring-primary-pink focus:border-primary-pink ${
                    errors.slug ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="home"
                />
              </div>
              {errors.slug ? (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  The URL slug determines the page's web address.
                </p>
              )}
            </div>
            
            {/* Page Type */}
            <div>
              <label htmlFor="page_type" className="block text-sm font-medium text-gray-700 mb-1">
                Page Type
              </label>
              <select
                id="page_type"
                name="page_type"
                value={formData.page_type || 'Custom'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
              >
                {PAGE_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Categorizes the page for organizational purposes.
              </p>
            </div>
            
            {/* Page Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-pink focus:ring-primary-pink border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Draft</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-pink focus:ring-primary-pink border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Published</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Draft pages are only visible to you. Published pages are visible to visitors.
              </p>
            </div>
            
            {/* SEO Settings */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">SEO Settings</h3>
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    id="meta_title"
                    name="meta_title"
                    type="text"
                    value={formData.meta_title || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                    placeholder="SEO title for search engines"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended length: 50-60 characters
                  </p>
                </div>
                
                <div>
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                    placeholder="Brief description for search results"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended length: 150-160 characters
                  </p>
                </div>
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
            disabled={saving}
            className={`px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-primary-dark-purple transition-colors duration-200 flex items-center ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
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
                {formData.isNew ? 'Create Page' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageFormModal;