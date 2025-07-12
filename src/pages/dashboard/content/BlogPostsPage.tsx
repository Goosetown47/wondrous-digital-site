import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { useProject } from '../../../contexts/ProjectContext';
import { Eye, Edit, Trash2, Plus, Search, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { deletePostWithImages } from '../../../utils/image-cleanup';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';

// Post type definition based on our database schema
interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author_name: string;
  published_at: string;
  featured_image: string | null;
  tags: string[] | null;
  read_time: number | null;
}

const BlogPostsPage = () => {
  // Get project context
  const { selectedProject, loading: projectLoading, projectSwitching } = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Component state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Fetch posts whenever the selected project changes
  useEffect(() => {
    if (selectedProject) {
      fetchPosts();
    }
  }, [selectedProject]);

  // Check for success message in navigation state
  useEffect(() => {
    if (location.state && location.state.success) {
      setSuccessMessage(location.state.message || 'Operation completed successfully!');
      
      // Clear the success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Reset success message when search term changes
  useEffect(() => {
    setSuccessMessage(null);
  }, [searchTerm]);

  // Function to fetch posts for the selected project
  const fetchPosts = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, author_name, published_at, featured_image, tags, read_time')
        .eq('project_id', selectedProject.id)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load blog posts');
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
      day: 'numeric'
    }).format(date);
  };

  // Filter posts based on search term
  const filteredPosts = searchTerm
    ? posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.author_name && post.author_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))))
    : posts;

  // Handle delete post
  const openDeleteModal = (post: Post) => {
    setPostToDelete(post);
  };

  const closeDeleteModal = () => {
    setPostToDelete(null);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    
    setIsDeletingPost(true);
    
    try {
      const result = await deletePostWithImages(postToDelete.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete post');
      }
      
      // Set success message
      setSuccessMessage(result.message || `Post "${postToDelete.title}" deleted successfully.`);
      
      // Update local posts array to remove the deleted post
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete.id));
      
      // Close the modal
      setPostToDelete(null);
    } catch (err: any) {
      console.error('Error in delete process:', err);
      setError(`Failed to delete post: ${err.message}`);
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Loading states
  if (projectLoading || projectSwitching) {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Posts</h1>
        <p className="text-gray-600">Please select a project to manage its blog posts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Blog Posts</h1>
          <p className="text-gray-600">
            Manage blog posts for{' '}
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
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => navigate('/dashboard/content/blog/new')}
            className="bg-primary-pink text-white px-4 py-2.5 rounded-lg font-medium inline-flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
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
            onClick={fetchPosts}
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
          <span className="text-gray-600">Loading posts...</span>
        </div>
      ) : (
        // Empty state
        posts.length === 0 ? (
          <div className="bg-white p-12 shadow-sm rounded-lg text-center">
            <div className="mb-4">
              <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                <Edit className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No blog posts yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Start creating blog posts to share your expertise and improve your search engine rankings.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/content/blog/new')}
              className="bg-primary-pink text-white px-4 py-2 rounded-lg font-medium inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first post
            </button>
          </div>
        ) : (
          // Posts table
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {post.featured_image ? (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={post.featured_image} 
                                alt="" 
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md mr-3 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No img</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                            <div className="text-xs text-gray-500">
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {post.tags.slice(0, 2).map((tag, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                  {post.tags.length > 2 && (
                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                      +{post.tags.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{post.author_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(post.published_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(post.published_at) <= new Date() ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Scheduled
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <a 
                            href={`/blog/${post.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-500"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <a 
                           onClick={() => navigate(`/dashboard/content/blog/edit/${post.id}`)}
                            className="text-blue-400 hover:text-blue-500"
                            title="Edit"
                           style={{ cursor: 'pointer' }}
                          >
                            <Edit className="h-4 w-4" />
                          </a>
                          <button 
                            onClick={() => openDeleteModal(post)}
                            className="text-red-400 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {searchTerm && filteredPosts.length === 0 && (
              <div className="px-6 py-4 text-center text-gray-500">
                No posts matching "{searchTerm}"
              </div>
            )}
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredPosts.length}</span> posts
              </p>
            </div>
          </div>
        )
      )}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!postToDelete}
        title="Delete Blog Post"
        itemName={postToDelete?.title || ''}
        onCancel={closeDeleteModal}
        onConfirm={confirmDeletePost}
        isDeleting={isDeletingPost}
      />
    </div>
  );
};

export default BlogPostsPage;