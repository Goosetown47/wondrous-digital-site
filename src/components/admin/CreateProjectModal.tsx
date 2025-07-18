import React, { useState, useEffect } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { supabase } from '../../utils/supabase';

interface Customer {
  id: string;
  business_name: string;
  contact_email: string;
  account_type: 'prospect' | 'customer' | 'inactive';
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    project_name: '',
    project_type: 'main_site' as const,
    customer_id: '',
    niche: ''
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Project type options
  const projectTypeOptions = [
    { value: 'main_site', label: 'Main Website' },
    { value: 'landing_page', label: 'Landing Page' },
    { value: 'template', label: 'Template' }
  ];

  // Common niche options
  const nicheOptions = [
    'restaurant',
    'legal',
    'healthcare',
    'dental',
    'veterinary',
    'fitness',
    'beauty',
    'real_estate',
    'automotive',
    'retail',
    'consulting',
    'technology',
    'other'
  ];

  // Fetch customers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      // Reset form when modal opens
      setFormData({
        project_name: '',
        project_type: 'main_site',
        customer_id: '',
        niche: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, business_name, contact_email, account_type')
        .in('account_type', ['prospect', 'customer'])
        .order('business_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setErrors({ general: 'Failed to load customers' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project name is required';
    }

    if (!formData.customer_id && formData.project_type !== 'template') {
      newErrors.customer_id = 'Customer is required for non-template projects';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare project data
      const projectData = {
        project_name: formData.project_name.trim(),
        project_type: formData.project_type,
        project_status: 'draft',
        customer_id: formData.customer_id || null,
        niche: formData.niche || null,
        deployment_status: 'none',
        is_active: true
      };

      const { error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Success - close modal and refresh parent
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to create project' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FolderPlus className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
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
              disabled={isSubmitting}
            />
            {errors.project_name && (
              <p className="mt-1 text-sm text-red-600">{errors.project_name}</p>
            )}
          </div>

          {/* Project Type */}
          <div>
            <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-1">
              Project Type
            </label>
            <select
              id="project_type"
              value={formData.project_type}
              onChange={(e) => handleInputChange('project_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              {projectTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Assignment */}
          <div>
            <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
              Customer {formData.project_type !== 'template' && '*'}
            </label>
            {loading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <span className="text-gray-500">Loading customers...</span>
              </div>
            ) : (
              <select
                id="customer_id"
                value={formData.customer_id}
                onChange={(e) => handleInputChange('customer_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customer_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">
                  {formData.project_type === 'template' ? 'No customer (Template)' : 'Select a customer'}
                </option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.business_name} ({customer.account_type})
                  </option>
                ))}
              </select>
            )}
            {errors.customer_id && (
              <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
            )}
          </div>

          {/* Niche */}
          <div>
            <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">
              Industry/Niche
            </label>
            <select
              id="niche"
              value={formData.niche}
              onChange={(e) => handleInputChange('niche', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Select industry (optional)</option>
              {nicheOptions.map(niche => (
                <option key={niche} value={niche}>
                  {niche.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              New projects start as <strong>Draft</strong> status. You can change the status later to move through the project lifecycle.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;