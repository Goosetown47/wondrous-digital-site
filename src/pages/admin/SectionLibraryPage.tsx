import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Plus, Edit, Trash2, Search, Loader, Code, Image, Tag, Filter, Layout, Eye } from 'lucide-react';
import AddSectionModal from '../../components/admin/AddSectionModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import HeroSplitLayout from '../../components/sections/HeroSplitLayout';

// Define the SectionTemplate interface based on our database schema
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

const SectionLibraryPage = () => {
  // State
  const [sectionTemplates, setSectionTemplates] = useState<SectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SectionTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<SectionTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive' | 'testing'>('all');
  const [selectedSectionToPreview, setSelectedSectionToPreview] = useState<SectionTemplate | null>(null);

  // Fetch section templates on component mount
  useEffect(() => {
    fetchSectionTemplates();
  }, []);

  // Function to fetch section templates
  const fetchSectionTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('section_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('template_name', { ascending: true });

      if (error) throw error;
      setSectionTemplates(data || []);
    } catch (err: any) {
      console.error('Error fetching section templates:', err);
      setError(err.message || 'Failed to load section templates');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit template
  const handleEditTemplate = (template: SectionTemplate) => {
    setEditingTemplate(template);
    setIsAddModalOpen(true);
  };

  // Handle delete template
  const handleDeleteTemplate = (template: SectionTemplate) => {
    setDeletingTemplate(template);
  };

  // Confirm delete template
  const confirmDeleteTemplate = async () => {
    if (!deletingTemplate) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('section_templates')
        .delete()
        .eq('id', deletingTemplate.id);
      
      if (error) throw error;
      
      // Update local state by removing the deleted template
      setSectionTemplates(prevTemplates => 
        prevTemplates.filter(template => template.id !== deletingTemplate.id)
      );
      
      setDeletingTemplate(null);
    } catch (err: any) {
      console.error('Error deleting section template:', err);
      setError(err.message || 'Failed to delete section template');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle preview section
  const handlePreviewSection = (template: SectionTemplate) => {
    setSelectedSectionToPreview(template);
  };

  // Close preview
  const closePreview = () => {
    setSelectedSectionToPreview(null);
  };

  // Filter section templates based on search term
  const searchFilteredTemplates = searchTerm
    ? sectionTemplates.filter(template =>
        template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.section_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.category && template.category.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : sectionTemplates;

  // Further filter by status if a specific status is selected
  const filteredTemplates = selectedStatusFilter === 'all' 
    ? searchFilteredTemplates 
    : searchFilteredTemplates.filter(template => 
        template.status === selectedStatusFilter);

  // Group templates by category
  const groupedTemplates: Record<string, SectionTemplate[]> = {};
  
  filteredTemplates.forEach(template => {
    const category = template.category || 'Uncategorized';
    if (!groupedTemplates[category]) {
      groupedTemplates[category] = [];
    }
    groupedTemplates[category].push(template);
  });
  
  // Render section preview based on section type
  const renderSectionPreview = (template: SectionTemplate) => {
    switch(template.section_type) {
      case 'hero':
        return <HeroSplitLayout 
          content={{
            headline: "Medium length hero headline goes here",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
            primaryButtonText: "Primary Button",
            secondaryButtonText: "Secondary Button"
          }}
          styling={{}}
          images={{}}
          links={{ primaryButtonLink: "#", secondaryButtonLink: "#" }}
        />;
      default:
        return (
          <div className="p-12 bg-gray-100 text-center">
            <p className="text-gray-500">No preview available for {template.section_type} type</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Section Library</h1>
            <p className="text-gray-600">
              Manage reusable sections for website templates
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Error state */}
            <div className="relative">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="w-full sm:w-40 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-pink focus:border-primary-pink appearance-none pr-10"
              >
                <option value="all">All Sections</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="testing">Testing</option>
              </select>
              <Filter className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 pointer-events-none h-4 w-4" />
            </div>
            <button 
              onClick={() => {
                setEditingTemplate(null);
                setIsAddModalOpen(true);
              }}
              className="bg-primary-pink text-white px-4 py-2.5 rounded-lg font-medium inline-flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Section
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p>{error}</p>
            <button 
              onClick={fetchSectionTemplates}
              className="text-sm font-medium text-red-800 underline mt-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Section Preview */}
        {selectedSectionToPreview && (
          <div className="mb-8 bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Layout className="h-4 w-4 text-gray-500" />
                <h3 className="font-medium text-gray-900">
                  Previewing: {selectedSectionToPreview.template_name}
                </h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  selectedSectionToPreview.status === 'active' ? 'bg-green-100 text-green-800' :
                  selectedSectionToPreview.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSectionToPreview.status}
                </span>
              </div>
              <button 
                onClick={closePreview} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              {renderSectionPreview(selectedSectionToPreview)}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="bg-white p-12 shadow-sm rounded-lg flex items-center justify-center">
            <Loader className="h-6 w-6 text-primary-pink animate-spin mr-2" />
            <span className="text-gray-600">Loading section templates...</span>
          </div>
        ) : (
          // Empty state
          sectionTemplates.length === 0 ? (
            <div className="bg-white p-12 shadow-sm rounded-lg text-center">
              <div className="mb-4">
                <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                  <Code className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No section templates yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Start creating section templates to build websites more efficiently.
                </p>
                <button 
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsAddModalOpen(true);
                  }}
                  className="bg-primary-pink text-white px-4 py-2 rounded-lg font-medium inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first section
                </button>
              </div>
            </div>
          ) : (
            // Section templates grid
            <div className="space-y-8">
              {Object.entries(groupedTemplates).map(([category, templates]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <div key={template.id} className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 flex flex-col">
                        {/* Preview Image */}
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          {template.preview_image_url ? (
                            <img 
                              src={template.preview_image_url} 
                              alt={template.template_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{template.template_name}</h3>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                  {template.section_type}
                                </span>
                                {template.category && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {template.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Preview Button */}
                          <button
                            onClick={() => handlePreviewSection(template)}
                            className="flex items-center text-xs text-primary-pink mt-2 hover:text-primary-dark-purple transition-colors"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview Section
                          </button>
                          
                          {/* Customizable Fields */}
                          <div className="mt-3 flex items-start">
                            <Tag className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                            <span className="text-xs text-gray-500">
                              {template.customizable_fields && Object.keys(template.customizable_fields).length > 0 
                                ? `${Object.keys(template.customizable_fields).length} customizable fields` 
                                : 'No customizable fields'}
                            </span>
                          </div>
                          
                          {/* Component Code Preview */}
                          <div className="mt-1 flex items-start">
                            <Code className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                            <span className="text-xs text-gray-500">
                              {template.component_code 
                                ? `${Math.min(150, template.component_code.length)} characters of code` 
                                : 'No component code'}
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="mt-4 flex justify-end space-x-2 pt-2 border-t border-gray-100">
                            <select
                              value={template.status}
                              onChange={async (e) => {
                                try {
                                  const { error } = await supabase
                                    .from('section_templates')
                                    .update({ status: e.target.value })
                                    .eq('id', template.id);
                                  
                                  if (error) throw error;
                                  
                                  // Update local state
                                  setSectionTemplates(prevTemplates => 
                                    prevTemplates.map(t => 
                                      t.id === template.id ? {...t, status: e.target.value as 'active' | 'inactive' | 'testing'} : t
                                    )
                                  );
                                } catch (err) {
                                  console.error('Error updating section status:', err);
                                  setError('Failed to update section status');
                                }
                              }}
                              className="text-xs px-2 py-1.5 border border-gray-300 rounded text-gray-700 bg-gray-50 mr-2"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="testing">Testing</option>
                            </select>
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit section"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete section"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* If filtered results are empty */}
              {filteredTemplates.length === 0 && searchTerm && (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                  <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No matching templates found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search or 
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="text-primary-pink hover:underline ml-1"
                    >
                      clear the search
                    </button>
                  </p>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Add/Edit Section Modal - Moved outside the space-y-6 container */}
      <AddSectionModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={() => {
          fetchSectionTemplates();
          setIsAddModalOpen(false);
          setEditingTemplate(null);
        }}
        editingTemplate={editingTemplate}
      />

      {/* Delete Confirmation Modal - Moved outside the space-y-6 container */}
      <DeleteConfirmationModal
        isOpen={!!deletingTemplate}
        title="Delete Section Template"
        itemName={deletingTemplate?.template_name || ''}
        onCancel={() => setDeletingTemplate(null)}
        onConfirm={confirmDeleteTemplate}
        isDeleting={isDeleting}
      />
    </>
  );
};

// Add a missing "X" icon import
import { X } from 'lucide-react';

export default SectionLibraryPage;