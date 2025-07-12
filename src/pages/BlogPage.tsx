import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { blogService } from '../utils/supabase';

const BlogPage = () => {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage]);

  const loadPosts = async (page) => {
    try {
      setLoading(true);
      console.log('Loading posts for page:', page);
      
      // Get posts - 13 total (1 featured + 12 for grid)
      const result = await blogService.getPosts(page, 13);
      console.log('Posts result:', result);
      
      if (page === 1 && result.posts.length > 0) {
        // On first page, set the first post as featured and the rest for the grid
        setFeaturedPost(result.posts[0]);
        setPosts(result.posts.slice(1));
        console.log('Featured post:', result.posts[0]);
        console.log('Grid posts:', result.posts.slice(1));
      } else {
        // On subsequent pages, all posts go to the grid
        setFeaturedPost(null);
        setPosts(result.posts);
        console.log('All posts for grid:', result.posts);
      }
      
      // Calculate total pages based on 12 posts per page after the first page
      const totalPosts = result.totalCount;
      const postsAfterFeatured = Math.max(0, totalPosts - 1);
      const additionalPages = Math.ceil(postsAfterFeatured / 12);
      setTotalPages(Math.max(1, additionalPages));
      
      setError(null);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(`Failed to load blog posts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    scrollToTop();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-display text-gray-900 mb-4">Unable to Load Blog</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Simple Header Section */}
        <div className="mb-16">
          <p className="text-primary-pink font-medium mb-4">Wondrous Blog</p>
          <h1 className="text-4xl lg:text-5xl font-display text-gray-900 mb-6 max-w-2xl" style={{ color: 'rgb(31, 10, 66)' }}>
            Take things to the next level
          </h1>
          <p className="text-gray-600 text-lg max-w-xl">
            This blog aims to deliver quick reads that help you think differently about how to scale up your business in the digital space. We're not trying to sell you on our services, just provide valuable insights and thoughts that could change how you think.
          </p>
        </div>

        {loading ? (
          <div className="space-y-16">
            {/* Featured Posts Skeleton */}
            <div className="animate-pulse">
              <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="w-16 h-1 bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-200 aspect-[4/3] rounded-2xl"></div>
                <div className="space-y-4">
                  <div className="bg-gray-200 aspect-video rounded-xl"></div>
                  <div className="bg-gray-200 aspect-video rounded-xl"></div>
                  <div className="bg-gray-200 aspect-video rounded-xl"></div>
                </div>
              </div>
            </div>
            
            {/* Latest Posts Skeleton */}
            <div className="animate-pulse">
              <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="w-16 h-1 bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="bg-gray-200 aspect-video rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Blog Posts Section */}
            {(featuredPost || posts.length > 0) && currentPage === 1 && (
              <section className="mb-20">
                <div className="mb-12">
                  <h2 className="text-2xl font-display text-gray-900 mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
                    Featured blog posts
                  </h2>
                  <div className="w-16 h-1 bg-primary-pink"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Large Featured Post */}
                  {featuredPost && (
                    <article className="group">
                      <Link to={`/blog/${featuredPost.slug}`} className="block">
                        {/* Featured Image */}
                        {featuredPost.featured_image && (
                          <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-6 group-hover:shadow-lg transition-all duration-300">
                            <img 
                              src={featuredPost.featured_image} 
                              alt={featuredPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="space-y-4">
                          {/* Tags and Read Time */}
                          <div className="flex items-center justify-between">
                            {featuredPost.tags && featuredPost.tags.length > 0 && (
                              <span className="text-sm font-medium text-primary-pink">
                                {featuredPost.tags[0]}
                              </span>
                            )}
                            {featuredPost.read_time && (
                              <span className="text-sm text-gray-500">
                                {featuredPost.read_time} min read
                              </span>
                            )}
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-2xl font-display text-gray-900 group-hover:text-primary-pink transition-colors duration-200 leading-tight">
                            {featuredPost.title}
                          </h3>
                          
                          {/* Excerpt */}
                          {featuredPost.excerpt && (
                            <p className="text-gray-600 leading-relaxed line-clamp-3">
                              {featuredPost.excerpt}
                            </p>
                          )}
                          
                          {/* Read More */}
                          <div className="flex items-center text-primary-pink font-medium group-hover:text-primary-dark-purple transition-colors duration-200">
                            <span>Read more</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </Link>
                    </article>
                  )}
                  
                  {/* Three Smaller Posts */}
                  <div className="space-y-6">
                    {posts.slice(0, 3).map((post) => (
                      <article key={post.id} className="group">
                        <Link to={`/blog/${post.slug}`} className="block">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Small Featured Image */}
                            {post.featured_image && (
                              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden group-hover:shadow-md transition-all duration-300">
                                <img 
                                  src={post.featured_image} 
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            
                            {/* Content */}
                            <div className="sm:col-span-2 space-y-2">
                              {/* Tags and Read Time */}
                              <div className="flex items-center justify-between">
                                {post.tags && post.tags.length > 0 && (
                                  <span className="text-xs font-medium text-primary-pink">
                                    {post.tags[0]}
                                  </span>
                                )}
                                {post.read_time && (
                                  <span className="text-xs text-gray-500">
                                    {post.read_time} min read
                                  </span>
                                )}
                              </div>
                              
                              {/* Title */}
                              <h3 className="font-display text-gray-900 group-hover:text-primary-pink transition-colors duration-200 leading-tight">
                                {post.title}
                              </h3>
                              
                              {/* Read More */}
                              <div className="flex items-center text-primary-pink font-medium text-sm group-hover:text-primary-dark-purple transition-colors duration-200">
                                <span>Read more</span>
                                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Latest Blog Posts Section */}
            {(posts.length > 3 || currentPage > 1) && (
              <section>
                <div className="mb-12">
                  <h2 className="text-2xl font-display text-gray-900 mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
                    Latest blog posts
                  </h2>
                  <div className="w-16 h-1 bg-primary-pink"></div>
                </div>
                
                {/* Masonry-style Grid - limiting to 12 posts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {(currentPage === 1 ? posts.slice(3, 15) : posts.slice(0, 12)).map((post) => (
                    <article key={post.id} className="group">
                      <Link to={`/blog/${post.slug}`} className="block">
                        {/* Featured Image */}
                        {post.featured_image && (
                          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4 group-hover:shadow-lg transition-all duration-300">
                            <img 
                              src={post.featured_image} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="space-y-3">
                          {/* Tags and Read Time */}
                          <div className="flex items-center justify-between">
                            {post.tags && post.tags.length > 0 && (
                              <span className="text-sm font-medium text-primary-pink">
                                {post.tags[0]}
                              </span>
                            )}
                            {post.read_time && (
                              <span className="text-sm text-gray-500">
                                {post.read_time} min read
                              </span>
                            )}
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-xl font-display text-gray-900 group-hover:text-primary-pink transition-colors duration-200 leading-tight">
                            {post.title}
                          </h3>
                          
                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-gray-600 leading-relaxed line-clamp-3">
                              {post.excerpt}
                            </p>
                          )}
                          
                          {/* Read More */}
                          <div className="flex items-center text-primary-pink font-medium group-hover:text-primary-dark-purple transition-colors duration-200">
                            <span>Read more</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* No Posts Message */}
            {posts.length === 0 && !featuredPost && !loading && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-display text-gray-900 mb-4">No Posts Yet</h2>
                <p className="text-gray-600">Check back soon for new content!</p>
              </div>
            )}

            {/* Pagination - only show if more than 12 posts total */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-16">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-12 h-12 rounded-lg font-medium transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-primary-pink text-white shadow-lg'
                            : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;