import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { blogService } from '../utils/supabase';
import { marked } from 'marked';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug) => {
    try {
      setLoading(true);
      const postData = await blogService.getPostBySlug(postSlug);
      setPost(postData);
      setError(null);

      // Update page title and meta description for SEO
      document.title = `${postData.title} | Wondrous Digital Blog`;
      if (postData.excerpt) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.content = postData.excerpt;
        }
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Post not found');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-display text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center text-primary-pink hover:text-primary-dark-purple transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link 
          to="/blog" 
          className="inline-flex items-center text-primary-pink hover:text-primary-dark-purple transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-gray-900 leading-tight mb-8">
          {post.title}
        </h1>

        <div className="flex items-center space-x-6 pb-8">
          <div className="flex items-center space-x-3">
            {post.author_avatar ? (
              <img 
                src={post.author_avatar} 
                alt={post.author_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-pink/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-pink" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{post.author_name}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                {post.read_time && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.read_time} min read</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="font-medium text-primary-pink bg-primary-pink/10 px-3 py-1 rounded-full"
                style={{ fontSize: '0.75rem' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.featured_image && (
          <div className="mb-12">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        )}

        <div className="max-w-none prose prose-lg prose-headings:font-display prose-headings:text-primary-dark-purple prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary-pink prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary-pink prose-img:rounded-lg prose-table:border-collapse">
          <div
            dangerouslySetInnerHTML={{ __html: marked.parse(post.content, { gfm: true, tables: true }) }}
          ></div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-primary-pink hover:text-primary-dark-purple transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Read More Articles
          </Link>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;