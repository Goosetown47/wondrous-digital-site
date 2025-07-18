import React, { useState, useEffect } from 'react';
import { X, Copy, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useToast } from '../../contexts/ToastContext';
import { createProjectSchema } from '../../schemas';

interface Customer {
  id: string;
  business_name: string;
  account_type: 'prospect' | 'customer' | 'inactive';
}

interface CloneProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceProject: {
    id: string;
    project_name: string;
    project_type: string;
    customer_id: string | null;
    business_name: string | null;
  } | null;
  onSuccess: () => void;
}

const CloneProjectModal: React.FC<CloneProjectModalProps> = ({
  isOpen,
  onClose,
  sourceProject,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    project_name: '',
    project_type: 'main_site' as 'main_site' | 'landing_page' | 'template',
    customer_id: '',
    niche: null as string | null
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCloning, setIsCloning] = useState(false);
  const { addToast } = useToast();

  // Reset form when modal opens with source project
  useEffect(() => {
    if (isOpen && sourceProject) {
      setFormData({
        project_name: `${sourceProject.project_name} (Copy)`,
        project_type: sourceProject.project_type as 'main_site' | 'landing_page' | 'template',
        customer_id: sourceProject.customer_id || '',
        niche: null
      });
      setErrors({});
    }
  }, [isOpen, sourceProject]);

  // Fetch customers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, business_name, account_type')
        .in('account_type', ['prospect', 'customer'])
        .order('business_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      addToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceProject) return;

    // Validate with Zod
    const zodResult = createProjectSchema.safeParse(formData);
    if (!zodResult.success) {
      const zodErrors = zodResult.error.format();
      const newErrors: Record<string, string> = {};
      
      if (zodErrors.project_name?._errors?.length > 0) {
        newErrors.project_name = zodErrors.project_name._errors[0];
      }
      if (zodErrors.project_type?._errors?.length > 0) {
        newErrors.project_type = zodErrors.project_type._errors[0];
      }
      if (zodErrors.customer_id?._errors?.length > 0) {
        newErrors.customer_id = zodErrors.customer_id._errors[0];
      }
      
      // Handle top-level errors (like the refine for customer_id requirement)
      if (zodErrors._errors?.length > 0) {
        newErrors.customer_id = zodErrors._errors[0];
      }
      
      setErrors(newErrors);
      addToast('Please fix the validation errors', 'error');
      return;
    }

    setIsCloning(true);
    setErrors({});

    try {
      // Start cloning process
      addToast('Starting project clone...', 'info');

      // 1. Get source project details (validate it exists)
      const { error: sourceError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', sourceProject.id)
        .single();

      if (sourceError) throw sourceError;

      // 2. Create new project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          project_name: formData.project_name,
          project_type: formData.project_type,
          customer_id: formData.customer_id || null,
          project_status: 'draft', // Always start as draft
          deployment_status: 'none',
          domain: null,
          subdomain: null,
          deployment_url: null,
          last_deployed_at: null,
          niche: formData.niche
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // 3. Clone site styles
      const { data: siteStyles, error: stylesError } = await supabase
        .from('site_styles')
        .select('*')
        .eq('project_id', sourceProject.id)
        .single();

      if (!stylesError && siteStyles) {
        // Extract only the fields we want to clone (exclude id, timestamps, and project_id)
        const { id: _id, project_id: _pid, created_at: _cat, updated_at: _uat, ...styleData } = siteStyles;
        await supabase
          .from('site_styles')
          .insert({
            ...styleData,
            project_id: newProject.id
          });
      }

      // 4. Clone pages
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', sourceProject.id);

      if (!pagesError && pages && pages.length > 0) {
        for (const page of pages) {
          const { id: _pageId, project_id: _projId, created_at: _createdAt, updated_at: _updatedAt, ...pageData } = page;
          const { error: newPageError } = await supabase
            .from('pages')
            .insert({
              ...pageData,
              project_id: newProject.id
            });

          if (newPageError) throw newPageError;
        }
      }

      addToast(`Successfully cloned project: ${formData.project_name}`, 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error cloning project:', error);
      addToast(
        'Failed to clone project: ' + (error as Error).message,
        'error'
      );
    } finally {
      setIsCloning(false);
    }
  };

  if (!isOpen || !sourceProject) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Copy className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Clone Project</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isCloning}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Source Project Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Cloning from:</p>
            <p className="font-medium text-gray-900">{sourceProject.project_name}</p>
            {sourceProject.business_name && (
              <p className="text-sm text-gray-500">{sourceProject.business_name}</p>
            )}
          </div>

          {/* Project Name */}
          <div className="mb-4">
            <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
              New Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="project_name"
              value={formData.project_name}
              onChange={(e) => handleInputChange('project_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.project_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
              disabled={isCloning}
              aria-invalid={!!errors.project_name}
              aria-describedby={errors.project_name ? 'project_name-error' : undefined}
            />
            {errors.project_name && (
              <p id="project_name-error" className="mt-1 text-sm text-red-600">
                {errors.project_name}
              </p>
            )}
          </div>

          {/* Project Type */}
          <div className="mb-4">
            <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-1">
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              id="project_type"
              value={formData.project_type}
              onChange={(e) => handleInputChange('project_type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.project_type ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isCloning}
            >
              <option value="main_site">Main Site</option>
              <option value="landing_page">Landing Page</option>
              <option value="template">Template</option>
            </select>
            {errors.project_type && (
              <p className="mt-1 text-sm text-red-600">{errors.project_type}</p>
            )}
          </div>

          {/* Customer Selection */}
          {formData.project_type !== 'template' && (
            <div className="mb-4">
              <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Customer <span className="text-red-500">*</span>
              </label>
              <select
                id="customer_id"
                value={formData.customer_id}
                onChange={(e) => handleInputChange('customer_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customer_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isCloning || loading}
              >
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.business_name} ({customer.account_type})
                  </option>
                ))}
              </select>
              {errors.customer_id && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
              )}
            </div>
          )}

          {/* Info Message */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  The cloned project will start in "Draft" status and include all pages, sections, and styling from the original project.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCloning}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCloning}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isCloning ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Cloning...
              </span>
            ) : (
              <span className="flex items-center">
                <Copy className="h-4 w-4 mr-2" />
                Clone Project
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloneProjectModal;