import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useToast } from '../../contexts/ToastContext';
import { useProject } from '../../contexts/ProjectContext';

interface Project {
  id: string;
  project_name: string;
  project_status: string;
  project_type: string;
}

interface ConvertToTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedProject?: Project | null;
}

const ConvertToTemplateModal: React.FC<ConvertToTemplateModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  preselectedProject 
}) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const { addToast } = useToast();
  const { refreshData } = useProject();
  const [formData, setFormData] = useState({
    project_id: '',
    template_status: 'template-internal' as 'template-internal' | 'template-public',
    template_description: '',
    template_niche: 'general',
    template_version: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch eligible projects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEligibleProjects();
      if (preselectedProject) {
        setFormData(prev => ({
          ...prev,
          project_id: preselectedProject.id
        }));
      }
    }
  }, [isOpen, preselectedProject]);

  const fetchEligibleProjects = async () => {
    try {
      // Fetch projects that can be converted to templates (not already templates)
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_name, project_status, project_type')
        .not('project_status', 'in', '("template-internal","template-public")')
        .order('project_name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.project_id) {
      newErrors.project_id = 'Please select a project to convert';
    }

    if (!formData.template_description.trim()) {
      newErrors.template_description = 'Template description is required';
    } else if (formData.template_description.length > 500) {
      newErrors.template_description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Update project to template status with metadata
      const { error } = await supabase
        .from('projects')
        .update({
          project_status: formData.template_status,
          template_description: formData.template_description.trim(),
          template_niche: formData.template_niche,
          template_version: formData.template_version,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.project_id);

      if (error) throw error;

      // Log the action
      const user = await supabase.auth.getUser();
      const project = projects.find(p => p.id === formData.project_id);
      
      if (user.data.user && project) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.data.user.id,
            action_type: 'update',
            entity_type: 'project',
            entity_id: formData.project_id,
            old_data: {
              project_status: project.project_status
            },
            new_data: {
              project_status: formData.template_status,
              template_description: formData.template_description,
              template_niche: formData.template_niche
            }
          });
      }

      addToast(
        `${project?.project_name} has been converted to a ${formData.template_status === 'template-public' ? 'public' : 'internal'} template`,
        'success'
      );
      
      // Reset form
      setFormData({
        project_id: '',
        template_status: 'template-internal',
        template_description: '',
        template_niche: 'general',
        template_version: 1
      });
      setErrors({});
      
      await refreshData();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error converting to template:', error);
      addToast('Failed to convert project to template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  const niches = [
    { value: 'veterinarian', label: 'Veterinarian' },
    { value: 'chiropractor', label: 'Chiropractor' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'medical', label: 'Medical' },
    { value: 'legal', label: 'Legal' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'retail', label: 'Retail' },
    { value: 'general', label: 'General' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Convert Project to Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Project <span className="text-red-500">*</span>
            </label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              disabled={!!preselectedProject}
              className={`w-full px-3 py-2 border ${errors.project_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${preselectedProject ? 'bg-gray-100' : ''}`}
            >
              <option value="">Choose a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.project_name} ({project.project_type})
                </option>
              ))}
            </select>
            {errors.project_id && (
              <p className="mt-1 text-sm text-red-600">{errors.project_id}</p>
            )}
          </div>

          {/* Template Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="template_status"
                  value="template-internal"
                  checked={formData.template_status === 'template-internal'}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">
                  <span className="font-medium">Internal</span> - Only visible to admins for cloning
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="template_status"
                  value="template-public"
                  checked={formData.template_status === 'template-public'}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">
                  <span className="font-medium">Public</span> - Deployed to public subdomain for showcase
                </span>
              </label>
            </div>
          </div>

          {/* Template Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="template_description"
              value={formData.template_description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border ${errors.template_description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Describe this template and its key features..."
            />
            {errors.template_description && (
              <p className="mt-1 text-sm text-red-600">{errors.template_description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.template_description.length}/500 characters
            </p>
          </div>

          {/* Template Niche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Niche
            </label>
            <select
              name="template_niche"
              value={formData.template_niche}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {niches.map(niche => (
                <option key={niche.value} value={niche.value}>
                  {niche.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the business type this template is designed for
            </p>
          </div>
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
                Converting...
              </>
            ) : (
              'Convert to Template'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertToTemplateModal;