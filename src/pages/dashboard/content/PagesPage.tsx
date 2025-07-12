import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { useProject } from '../../../contexts/ProjectContext';
import { Eye, Edit, Trash2, Plus, Search, Loader, Copy, Layout } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import PageFormModal from '../../../components/dashboard/PageFormModal';

// Page type definition based on database schema
interface Page {
  id: string;
  project_id: string;
  page_name: string;
  slug: string;
  page_type: string | null;
  status: 'draft' | 'published';
  sections: any[] | null;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
}

// Type for page being edited
interface EditingPage extends Partial<Page> {
  isNew?: boolean;
}

const PagesPage: React.FC = () => {
  // Get project context
  const { selectedProject, loading: projectLoading } = useProject();
  const navigate = useNavigate();
  
  // Component state
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [isDeletingPage, setIsDeletingPage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<EditingPage | null>(null);

  // Fetch pages whenever the selected project changes
  useEffect(() => {
    if (selectedProject) {
      fetchPages();
    }
  }, [selectedProject]);

  // Clear success message when search term changes
  useEffect(() => {
    setSuccessMessage(null);
  }, [searchTerm]);

  // Function to fetch pages for the selected project
  const fetchPages = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (err: any) {
      console.error('Error fetching pages:', err);
      setError(err.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filter pages based on search term
  const filteredPages = searchTerm
    ? pages.filter(page => 
        page.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (page.page_type && page.page_type.toLowerCase().includes(searchTerm.toLowerCase())))
    : pages;

  // Handle opening the modal for a new page
  const handleAddPage = () => {
    setEditingPage({ 
      isNew: true,
      project_id: selectedProject?.id || '',
      status: 'draft',
      sections: []
    });
    setIsModalOpen(true);
  };

  // Handle opening the modal for editing a page
  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setIsModalOpen(true);
  };

  // Handle duplicating a page
  const handleDuplicatePage = async (page: Page) => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      
      // Create a new page based on the selected one
      const duplicatedPage = {
        project_id: selectedProject.id,
        page_name: `${page.page_name} (Copy)`,
        slug: `${page.slug}-copy`,
        page_type: page.page_type,
        status: 'draft',
        sections: page.sections,
        meta_title: page.meta_title,
        meta_description: page.meta_description
      };
      
      // Check if the slug already exists and add a number if necessary
      let newSlug = duplicatedPage.slug;
      let counter = 1;
      
      let existingPage = pages.find(p => p.slug === newSlug);
      
      while (existingPage) {
        newSlug = `${page.slug}-copy-${counter}`;
        counter++;
        existingPage = pages.find(p => p.slug === newSlug);
      }
      
      duplicatedPage.slug = newSlug;
      
      // Insert the new page
      const { data, error } = await supabase
        .from('pages')
        .insert([duplicatedPage])
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Update local state
      setPages(prevPages => [data, ...prevPages]);
      setSuccessMessage(`Page "${page.page_name}" duplicated successfully.`);
    } catch (err: any) {
      console.error('Error duplicating page:', err);
      setError(err.message || 'Failed to duplicate page');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete page
  const openDeleteModal = (page: Page) => {
    setPageToDelete(page);
  };

  const closeDeleteModal = () => {
    setPageToDelete(null);
  };

  const confirmDeletePage = async () => {
    if (!pageToDelete) return;
    
    setIsDeletingPage(true);
    
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageToDelete.id);
        
      if (error) throw error;
      
      // Set success message
      setSuccessMessage(`Page "${pageToDelete.page_name}" deleted successfully.`);
      
      // Update local pages array to remove the deleted page
      setPages(prevPages => prevPages.filter(page => page.id !== pageToDelete.id));
      
      // Close the modal
      setPageToDelete(null);
    } catch (err: any) {
      console.error('Error deleting page:', err);
      setError(`Failed to delete page: ${err.message}`);
    } finally {
      setIsDeletingPage(false);
    }
  };

  // Handle save from the modal
  const handleSavePage = async (page: EditingPage) => {
    try {
      setLoading(true);
      
      if (page.isNew) {
        // Create a new page
        const { data, error } = await supabase
          .from('pages')
          .insert([{
            project_id: selectedProject?.id,
            page_name: page.page_name,
            slug: page.slug,
            page_type: page.page_type,
            status: page.status,
            sections: page.sections || [],
            meta_title: page.meta_title,
            meta_description: page.meta_description
          }])
          .select('*')
          .single();
          
        if (error) throw error;
        
        // Update local state
        setPages(prevPages => [data, ...prevPages]);
        setSuccessMessage(`Page "${page.page_name}" created successfully.`);
      } else {
        // Update existing page
        const { data, error } = await supabase
          .from('pages')
          .update({
            page_name: page.page_name,
            slug: page.slug,
            page_type: page.page_type,
            status: page.status,
            meta_title: page.meta_title,
            meta_description: page.meta_description
          })
          .eq('id', page.id)
          .select('*')
          .single();
          
        if (error) throw error;
        
        // Update local state
        setPages(prevPages => prevPages.map(p => p.id === page.id ? data : p));
        setSuccessMessage(`Page "${page.page_name}" updated successfully.`);
      }
      
      setIsModalOpen(false);
      setEditingPage(null);
    } catch (err: any) {
      console.error('Error saving page:', err);
      setError(err.message || 'Failed to save page');
    } finally {
      setLoading(false);
    }
  };

  // Loading states
  if (projectLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // No project selected
  if (!selectedProject) {
    return (
      <div className="bg-white p-6 shadow-sm rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pages</h1>
        <p className="text-gray-600">Please select a project to manage its pages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Pages</h1>
          <p className="text-gray-600">
            Manage pages for{' '}
            <span className="font-medium text-primary-pink">{selectedProject.project_name}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-pink focus:border-primary-pink block w-full pl-10 p-2.5"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleAddPage}
            className="bg-primary-pink text-white px-4 py-2.5 rounded-lg font-medium inline-flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchPages}
            className="text-sm font-medium text-red-800 underline mt-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white p-12 shadow-sm rounded-lg flex items-center justify-center">
          <Loader className="h-6 w-6 text-primary-pink animate-spin mr-2" />
          <span className="text-gray-600">Loading pages...</span>
        </div>
      ) : (
        // Empty state
        pages.length === 0 ? (
          <div className="bg-white p-12 shadow-sm rounded-lg text-center">
            <div className="mb-4">
              <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                <Layout className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No pages yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Start creating pages to build your website structure. Each page can be customized with various sections.
              </p>
            </div>
            <button 
              onClick={handleAddPage}
              className="bg-primary-pink text-white px-4 py-2 rounded-lg font-medium inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first page
            </button>
          </div>
        ) : (
          // Pages grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <div 
                key={page.id} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">{page.page_name}</h2>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEditPage(page)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit Page"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDuplicatePage(page)}
                        className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                        title="Duplicate Page" 
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/dashboard/content/pages/builder/${page.id}`}
                        className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                        title="Open Page Builder"
                      >
                        <Layout className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => openDeleteModal(page)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="text-primary-pink">/{page.slug}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {page.page_type && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {page.page_type}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                      </span>
                    </div>
                    
                    <span className="text-xs text-gray-500">
                      Updated {formatDate(page.updated_at)}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {page.sections ? (page.sections as any[]).length : 0} sections
                    </div>
                    
                    <a 
                      href={`/${page.slug}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-pink hover:text-primary-dark-purple inline-flex items-center text-sm"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!pageToDelete}
        title="Delete Page"
        itemName={pageToDelete?.page_name || ''}
        onCancel={closeDeleteModal}
        onConfirm={confirmDeletePage}
        isDeleting={isDeletingPage}
      />
      
      {/* Page Form Modal */}
      {isModalOpen && (
        <PageFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPage(null);
          }}
          onSave={handleSavePage}
          page={editingPage}
          existingPages={pages}
        />
      )}
    </div>
  );
};

export default PagesPage;