import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../utils/supabase';
import { FileText, Plus, Edit3, Eye, ArrowLeft, Layers, Globe, Calendar, Home } from 'lucide-react';
import { useProject } from '../../../contexts/ProjectContext';
import { useToast } from '../../../contexts/ToastContext';
import DeploymentHistory from '../../../components/admin/DeploymentHistory';

interface Page {
  id: string;
  page_name: string;
  slug: string;
  status: 'draft' | 'published';
  is_homepage: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectDetails {
  id: string;
  project_name: string;
  project_type: string;
  project_status: string;
  domain: string | null;
  subdomain: string | null;
  deployment_status: string;
  deployment_url: string | null;
  created_at: string;
  updated_at: string;
  business_name: string | null;
}

const ProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProject } = useProject();
  const { addToast } = useToast();
  
  const [pages, setPages] = useState<Page[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Get project ID from location state or selected project
  const projectId = location.state?.projectId || selectedProject?.id;
  
  // Calculate published pages count
  const publishedPagesCount = pages.filter(page => page.status === 'published').length;

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchPages();
    } else {
      addToast('No project selected', 'error');
      navigate('/dashboard');
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customers:customer_id (
            business_name
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;

      setProjectDetails({
        ...data,
        business_name: data.customers?.business_name || null
      });
    } catch (error) {
      console.error('Error fetching project details:', error);
      addToast('Failed to load project details', 'error');
    }
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      const pages = data || [];
      setPages(pages);
      
      // Ensure at least one page is marked as homepage
      const hasHomepage = pages.some(page => page.is_homepage);
      if (pages.length > 0 && !hasHomepage) {
        // Set the first page as homepage
        const firstPage = pages[0];
        await toggleHomepage(firstPage.id, true);
        // Re-fetch to get updated data
        await fetchPages();
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      addToast('Failed to load pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleHomepage = async (pageId: string, skipRefetch = false) => {
    try {
      // First, unset any existing homepage
      const { error: unsetError } = await supabase
        .from('pages')
        .update({ is_homepage: false })
        .eq('project_id', projectId)
        .eq('is_homepage', true);

      if (unsetError) throw unsetError;

      // Then set the new homepage
      const { error: setError } = await supabase
        .from('pages')
        .update({ is_homepage: true })
        .eq('id', pageId);

      if (setError) throw setError;

      addToast('Homepage updated successfully', 'success');
      
      if (!skipRefetch) {
        fetchPages();
      }
    } catch (error) {
      console.error('Error updating homepage:', error);
      addToast('Failed to update homepage', 'error');
    }
  };

  const createNewPage = async () => {
    setCreating(true);
    try {
      const pageName = `Page ${pages.length + 1}`;
      const slug = `page-${pages.length + 1}`;
      const isFirstPage = pages.length === 0;

      const { data, error } = await supabase
        .from('pages')
        .insert({
          project_id: projectId,
          page_name: pageName,
          slug: slug,
          status: 'draft',
          is_homepage: isFirstPage,
          order_index: pages.length,
          sections: []
        })
        .select()
        .single();

      if (error) throw error;

      addToast(`Created new page: ${pageName}`, 'success');
      fetchPages();
      
      // Navigate to page builder for the new page
      navigate(`/dashboard/content/pages/builder/${data.id}`);
    } catch (error) {
      console.error('Error creating page:', error);
      addToast('Failed to create page', 'error');
    } finally {
      setCreating(false);
    }
  };

  const navigateToPageBuilder = (pageId: string) => {
    navigate(`/dashboard/content/pages/builder/${pageId}`);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'template-internal': 'bg-purple-100 text-purple-800',
      'template-public': 'bg-purple-100 text-purple-800',
      'prospect-staging': 'bg-blue-100 text-blue-800',
      'live-customer': 'bg-green-100 text-green-800',
      'paused-maintenance': 'bg-yellow-100 text-yellow-800',
      'archived': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !projectDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/admin/projects')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </button>

        {projectDetails && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Layers className="h-6 w-6 mr-2 text-gray-500" />
                  {projectDetails.project_name}
                </h1>
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(projectDetails.project_status)}`}>
                    {projectDetails.project_status}
                  </span>
                  {projectDetails.business_name && (
                    <span className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      {projectDetails.business_name}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {new Date(projectDetails.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (!projectId || projectId === 'undefined') {
                      addToast('No project selected', 'error');
                      return;
                    }
                    window.open(`/preview/project/${projectId}`, '_blank');
                  }}
                  disabled={publishedPagesCount === 0}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    publishedPagesCount === 0 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                  title={publishedPagesCount === 0 ? 'No published pages to preview' : 'Preview website in browser'}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview in Browser
                  {publishedPagesCount === 0 && <span className="ml-1 text-xs">(No published pages)</span>}
                </button>
                <button
                  onClick={createNewPage}
                  disabled={creating}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      New Page
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pages</h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No pages yet</p>
            <button
              onClick={createNewPage}
              disabled={creating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Page
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pages.map((page) => (
              <div key={page.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {page.page_name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>/{page.slug}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {page.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      {page.is_homepage && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Homepage
                        </span>
                      )}
                      <span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleHomepage(page.id)}
                      className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                        page.is_homepage 
                          ? 'text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100' 
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                      title={page.is_homepage ? 'Current Homepage' : 'Set as Homepage'}
                    >
                      <Home className={`h-4 w-4 ${page.is_homepage ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => navigateToPageBuilder(page.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => window.open(`/preview/${page.id}`, '_blank')}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deployment History */}
      {projectId && (
        <div className="mt-6">
          <DeploymentHistory projectId={projectId} limit={5} />
        </div>
      )}
    </div>
  );
};

export default ProjectPage;