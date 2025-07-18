import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Edit, 
  Copy, 
  Globe, 
  Lock, 
  Trash2,
  Plus,
  Calendar,
  Tag
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import ActionButton from '../../components/admin/ActionButton';

interface Template {
  id: string;
  project_name: string;
  project_status: 'template-internal' | 'template-public';
  project_type: string;
  template_description?: string;
  template_niche?: string;
  template_version?: number;
  template_preview_image?: string;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'internal' | 'public';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterNiche, setFilterNiche] = useState<string>('all');
  const { addToast } = useToast();

  // Available niches
  const niches = [
    { value: 'all', label: 'All Niches' },
    { value: 'veterinarian', label: 'Veterinarian' },
    { value: 'chiropractor', label: 'Chiropractor' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'medical', label: 'Medical' },
    { value: 'legal', label: 'Legal' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'retail', label: 'Retail' },
    { value: 'general', label: 'General' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .in('project_status', ['template-internal', 'template-public'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      addToast('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.template_description && template.template_description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'internal' && template.project_status === 'template-internal') ||
      (filterStatus === 'public' && template.project_status === 'template-public');
    
    const matchesNiche = filterNiche === 'all' || 
      template.template_niche === filterNiche;

    return matchesSearch && matchesStatus && matchesNiche;
  });

  // Handle template status toggle
  const handleToggleStatus = async (template: Template) => {
    const newStatus = template.project_status === 'template-internal' ? 'template-public' : 'template-internal';
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          project_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id);

      if (error) throw error;

      addToast(
        `Template ${newStatus === 'template-public' ? 'made public' : 'made internal'}`,
        'success'
      );
      await fetchTemplates();
    } catch (error) {
      console.error('Error updating template status:', error);
      addToast('Failed to update template status', 'error');
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (template: Template) => {
    if (!confirm(`Are you sure you want to delete "${template.project_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', template.id);

      if (error) throw error;

      addToast('Template deleted successfully', 'success');
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      addToast('Failed to delete template', 'error');
    }
  };

  // Handle view template
  const handleViewTemplate = (templateId: string) => {
    navigate('/dashboard/content/project', { state: { projectId: templateId } });
  };

  // Handle edit template
  const handleEditTemplate = (template: Template) => {
    // TODO: Open edit modal with template metadata
    addToast('Edit template feature coming soon', 'info');
  };

  // Handle clone template
  const handleCloneTemplate = (template: Template) => {
    // Navigate to projects page with clone modal open
    navigate('/dashboard/admin/projects', { state: { cloneProjectId: template.id } });
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredTemplates.map((template) => (
        <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          {/* Template Preview Image */}
          <div className="aspect-video bg-gray-100 relative">
            {template.template_preview_image ? (
              <img 
                src={template.template_preview_image} 
                alt={template.project_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Grid className="h-12 w-12" />
              </div>
            )}
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              {template.project_status === 'template-public' ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <Lock className="h-3 w-3 mr-1" />
                  Internal
                </span>
              )}
            </div>
          </div>

          {/* Template Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{template.project_name}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {template.template_description || 'No description available'}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                {template.template_niche || 'General'}
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(template.updated_at).toLocaleDateString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <ActionButton
                  icon={Eye}
                  label="View"
                  onClick={() => handleViewTemplate(template.id)}
                  size="sm"
                />
                <ActionButton
                  icon={Edit}
                  label="Edit"
                  onClick={() => handleEditTemplate(template)}
                  size="sm"
                />
                <ActionButton
                  icon={Copy}
                  label="Clone"
                  onClick={() => handleCloneTemplate(template)}
                  size="sm"
                />
              </div>
              <div className="flex items-center space-x-1">
                <ActionButton
                  icon={template.project_status === 'template-public' ? Lock : Globe}
                  label={template.project_status === 'template-public' ? 'Make Internal' : 'Make Public'}
                  onClick={() => handleToggleStatus(template)}
                  size="sm"
                />
                <ActionButton
                  icon={Trash2}
                  label="Delete"
                  variant="danger"
                  onClick={() => handleDeleteTemplate(template)}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Template Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Niche
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTemplates.map((template) => (
            <tr key={template.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {template.project_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {template.template_description || 'No description'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {template.project_status === 'template-public' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Lock className="h-3 w-3 mr-1" />
                    Internal
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {template.template_niche || 'General'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {template.project_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(template.updated_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-1">
                  <ActionButton
                    icon={Eye}
                    label="View"
                    onClick={() => handleViewTemplate(template.id)}
                  />
                  <ActionButton
                    icon={Edit}
                    label="Edit"
                    onClick={() => handleEditTemplate(template)}
                  />
                  <ActionButton
                    icon={Copy}
                    label="Clone"
                    onClick={() => handleCloneTemplate(template)}
                  />
                  <ActionButton
                    icon={template.project_status === 'template-public' ? Lock : Globe}
                    label={template.project_status === 'template-public' ? 'Make Internal' : 'Make Public'}
                    onClick={() => handleToggleStatus(template)}
                  />
                  <ActionButton
                    icon={Trash2}
                    label="Delete"
                    variant="danger"
                    onClick={() => handleDeleteTemplate(template)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your website templates for different niches
            </p>
          </div>
          <button
            onClick={() => addToast('Convert to template feature coming soon', 'info')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Templates</option>
            <option value="internal">Internal Only</option>
            <option value="public">Public Only</option>
          </select>

          {/* Niche Filter */}
          <select
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {niches.map(niche => (
              <option key={niche.value} value={niche.value}>
                {niche.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Templates Display */}
      <div className="flex-1 min-h-0 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading templates...</p>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No templates found</p>
              <p className="text-sm text-gray-400 mt-2">
                Create your first template by converting an existing project
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          renderGridView()
        ) : (
          renderListView()
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;