import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useToast } from '../../contexts/ToastContext';
import { useProject } from '../../contexts/ProjectContext';

interface Customer {
  id: string;
  business_name: string;
  account_type: 'prospect' | 'customer' | 'inactive';
  custom_domains?: string[];
}

interface Project {
  id: string;
  project_name: string;
  customer_id: string | null;
  domain: string | null;
  subdomain: string | null;
  deployment_domain?: string | null;
  custom_domains?: string[];
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, project, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { addToast } = useToast();
  const { refreshData } = useProject();
  const [formData, setFormData] = useState({
    project_name: '',
    customer_id: '',
    domain: '',
    subdomain: '',
    deployment_domain: 'wondrousdigital.com'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch customers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name || '',
        customer_id: project.customer_id || '',
        domain: project.domain || '',
        subdomain: project.subdomain || '',
        deployment_domain: project.deployment_domain || 'wondrousdigital.com'
      });
      setErrors({});
    }
  }, [project]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, business_name, account_type, custom_domains')
        .order('business_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project name is required';
    }

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    // Domain validation (if provided)
    if (formData.domain && !/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(formData.domain)) {
      newErrors.domain = 'Invalid domain format (e.g., example.com)';
    }

    // Subdomain validation (if provided)
    if (formData.subdomain && !/^[a-z0-9]+(-[a-z0-9]+)*$/i.test(formData.subdomain)) {
      newErrors.subdomain = 'Invalid subdomain format (e.g., my-subdomain)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !project) return;
    
    setLoading(true);

    try {
      // Check if subdomain + deployment_domain combination is changing
      const subdomainChanged = (formData.subdomain.trim() || null) !== project.subdomain;
      const deploymentDomainChanged = formData.deployment_domain !== project.deployment_domain;
      
      // If both subdomain and deployment_domain are changing, we need to handle the unique constraint
      const updateData: any = {
        project_name: formData.project_name.trim(),
        customer_id: formData.customer_id,
        domain: formData.domain.trim() || null,
        deployment_domain: formData.deployment_domain,
        updated_at: new Date().toISOString()
      };
      
      // Only update subdomain if it's actually changing or deployment_domain is changing
      // This avoids unique constraint violations
      if (subdomainChanged || deploymentDomainChanged) {
        updateData.subdomain = formData.subdomain.trim() || null;
      }
      
      // Update project details
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);

      if (error) throw error;

      // Log the action
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.data.user.id,
            action_type: 'update',
            entity_type: 'project',
            entity_id: project.id,
            old_data: {
              project_name: project.project_name,
              customer_id: project.customer_id,
              domain: project.domain,
              subdomain: project.subdomain,
              deployment_domain: project.deployment_domain
            },
            new_data: {
              project_name: formData.project_name,
              customer_id: formData.customer_id,
              domain: formData.domain || null,
              subdomain: formData.subdomain || null,
              deployment_domain: formData.deployment_domain
            }
          });
      }

      addToast('Project updated successfully', 'success');
      await refreshData();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      addToast('Failed to update project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Project Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.project_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="My Awesome Project"
            />
            {errors.project_name && (
              <p className="mt-1 text-sm text-red-600">{errors.project_name}</p>
            )}
          </div>

          {/* Customer Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Customer <span className="text-red-500">*</span>
            </label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.customer_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.business_name} ({customer.account_type})
                </option>
              ))}
            </select>
            {errors.customer_id && (
              <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
            )}
          </div>

          {/* Deployment Configuration */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900">Deployment Settings</h3>
            
            {/* Deployment Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deployment Domain
              </label>
              <select
                name="deployment_domain"
                value={formData.deployment_domain}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="wondrousdigital.com">wondrousdigital.com</option>
                {/* Add customer's custom domains */}
                {(() => {
                  const selectedCustomer = customers.find(c => c.id === formData.customer_id);
                  return selectedCustomer?.custom_domains?.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ));
                })()}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The base domain for deployment
              </p>
            </div>

            {/* Subdomain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomain <span className="text-sm text-gray-500">(optional)</span>
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border ${errors.subdomain ? 'border-red-500' : 'border-gray-300'} rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="www or leave empty"
                />
                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                  .{formData.deployment_domain}
                </span>
              </div>
              {errors.subdomain ? (
                <p className="mt-1 text-sm text-red-600">{errors.subdomain}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for root domain, or use 'www', 'staging', etc.
                </p>
              )}
            </div>

            {/* Deployment URL Preview */}
            {(formData.subdomain || formData.deployment_domain) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 mb-1">Deployment URL:</p>
                <p className="text-sm font-medium text-blue-900 break-all">
                  https://{formData.subdomain ? `${formData.subdomain}.` : ''}{formData.deployment_domain}
                </p>
              </div>
            )}
          </div>

          {/* Legacy Domain Field - Hidden but preserved for data */}
          <input type="hidden" name="domain" value={formData.domain} />
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Project'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;