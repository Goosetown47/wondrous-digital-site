import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabase';
import { useProject } from '../../../contexts/ProjectContext';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import NestedList from '@editorjs/nested-list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Table from '@editorjs/table';
import LinkTool from '@editorjs/link';
import Image from '@editorjs/image';
import Delimiter from '@editorjs/delimiter';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Tag, Clock, Calendar, Image as ImageIcon } from 'lucide-react';
import { uploadImageToSupabase } from '../../../utils/editorjs-image-upload';
import FeaturedImageUpload from '../../../components/FeaturedImageUpload';
import { editorJsToMarkdown } from '../../../utils/editorjs-converter';

const NewBlogPostPage = () => {
  const navigate = useNavigate();
  const { selectedProject, userProfile } = useProject();
  const editorRef = useRef<EditorJS | null>(null);
  const editorHolderRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [readTime, setReadTime] = useState<number>(5);
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [publishDate, setPublishDate] = useState<string>('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  // Initialize publish date to current date/time
  useEffect(() => {
    const now = new Date();
    // Format date to YYYY-MM-DDThh:mm (local datetime format)
    const formattedDate = now.toISOString().slice(0, 16);
    setPublishDate(formattedDate);
  }, []);

  // Initialize Editor.js
  useEffect(() => {
    if (editorHolderRef.current && !editorRef.current) {
      const projectId = selectedProject?.id || 'temp';
      
      // Initialize editor only once
      editorRef.current = new EditorJS({
        holder: editorHolderRef.current,
        placeholder: 'Click on the plus button to add content...',
        autofocus: true,
        tools: {
           paragraph: {
             class: Paragraph,
             inlineToolbar: true,
           },
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2
            },
          },
          nestedList: {
            class: NestedList,
            inlineToolbar: true,
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author'
            }
          },
          code: {
            class: Code,
            config: {
              placeholder: 'Enter code here'
            }
          },
          delimiter: Delimiter,
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            }
          },
          image: {
            class: Image,
            config: {
              uploader: {
                uploadByFile: async (file: File) => {
                  try {
                    const url = await uploadImageToSupabase(file, projectId);
                    return {
                      success: 1,
                      file: {
                        url
                      }
                    };
                  } catch (error: any) {
                    console.error('Error uploading image:', error);
                    return {
                      success: 0,
                      file: {
                        url: ''
                      },
                      message: error.message
                    };
                  }
                },
                uploadByUrl: async (url: string) => {
                  return {
                    success: 1,
                    file: {
                      url
                    }
                  };
                }
              },
              captionPlaceholder: 'Image caption or attribution'
            }
          },
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: `https://api.linkpreview.net/?key=${import.meta.env.VITE_LINKPREVIEW_API_KEY || 'placeholder'}`
            }
          },
          marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M'
          },
          underline: {
            class: Underline,
            shortcut: 'CMD+U'
          }
        },
        onChange: async (api, event) => {
          if (editorRef.current) {
            const savedData = await editorRef.current.save();
            // Convert Editor.js data to markdown format
            const markdown = editorJsToMarkdown(savedData);
            setMarkdownContent(markdown);
            
            // Update read time based on content length
            const wordCount = markdown.trim().split(/\s+/).length;
            const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
            setReadTime(calculatedReadTime);
          }
        }
      });
    }
    
    // Cleanup
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // Generate slug from title
  useEffect(() => {
    if (title && !slugEdited) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')  // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      
      setSlug(generatedSlug);
    }
  }, [title, slugEdited]);

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject) {
      setError('No project selected. Please select a project first.');
      return;
    }

    if (!title || !slug || !markdownContent) {
      setError('Please fill in all required fields: title, slug, and content');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Check if we have Editor.js content
      if (!editorRef.current) {
        setError('Editor failed to initialize. Please refresh the page and try again.');
        setLoading(false);
        return;
      }
      
      // Get final Editor.js content
      const editorData = await editorRef.current.save();
      
      // Convert Editor.js data to markdown for storage
      const finalMarkdownContent = editorJsToMarkdown(editorData);
      
      // Make sure we have content
      if (!finalMarkdownContent.trim()) {
        setError('Please add some content to your blog post.');
        setLoading(false);
        return;
      }

      // Set published_at based on user choice
      let publishedAt;
      if (publishImmediately) {
        publishedAt = new Date().toISOString();
      } else {
        publishedAt = new Date(publishDate).toISOString();
      }

      // Create post in Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title,
            slug,
            content: finalMarkdownContent,
            excerpt,
            author_name: userProfile?.full_name || 'Anonymous',
            featured_image: featuredImage || null,
            published_at: publishedAt,
            read_time: readTime,
            tags: tags.length > 0 ? tags : null,
            project_id: selectedProject.id
          }
        ])
        .select('id')
        .single();

      if (error) throw error;

      // Redirect back to blog posts list
      navigate('/dashboard/content/blog', { 
        state: { 
          success: true,
          message: `Blog post "${title}" created successfully!` 
        } 
      });
    } catch (err: any) {
      console.error('Error creating blog post:', err);
      setError(err.message || 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedProject) {
    return (
      <div className="bg-white p-6 shadow-sm rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">New Blog Post</h1>
        <p className="text-gray-600">Please select a project to create a blog post.</p>
        <button
          onClick={() => navigate('/dashboard/content/blog')}
          className="mt-4 inline-flex items-center text-primary-pink hover:text-primary-dark-purple transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog Posts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">New Blog Post</h1>
          <p className="text-gray-600">
            Create a new blog post for{' '}
            <span className="font-medium text-primary-pink">{selectedProject.project_name}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/content/blog')}
          className="inline-flex items-center text-primary-pink hover:text-primary-dark-purple transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog Posts
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Title and Slug */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Post Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                placeholder="Enter post title"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                  placeholder="post-url-slug"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                URL-friendly version of the title (auto-generated, but you can edit it)
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="mb-1 flex justify-between items-center">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content <span className="text-red-500">*</span> 
              </label>
              <div className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{readTime} min read</span>
              </div>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-pink focus-within:border-primary-pink mb-1">
              <div 
                ref={editorHolderRef}
                id="editorjs"
                className="min-h-[500px] p-4" 
                style={{ 
                  background: "white",
                  borderRadius: "0.5rem"
                }}
              ></div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Rich editor with support for headings, lists, images, quotes, tables, buttons, and more.
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink h-20"
              placeholder="A short description of your post (appears in search results and post previews)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Brief summary shown on blog index page and search results.
            </p>
          </div>

          {/* Featured Image */}
          <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image
            </label>
            <FeaturedImageUpload 
              projectId={selectedProject?.id || 'default'}
              currentImageUrl={featuredImage}
              onImageUploaded={(url) => setFeaturedImage(url)}
            />
            <p className="mt-2 text-sm text-gray-500">
              Upload an image or drag and drop. This will appear as the post thumbnail.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                  placeholder="Add a tag..."
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="ml-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Press Enter or click Add to add multiple tags.
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reading Time */}
          <div>
            <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Reading Time (Minutes)
            </label>
            <div className="flex items-center">
              <div className="relative w-24">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="readTime"
                  type="number"
                  min="1"
                  value={readTime}
                  onChange={(e) => setReadTime(parseInt(e.target.value) || 1)}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                />
              </div>
              <span className="ml-2 text-gray-500 text-sm">minute read</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Auto-calculated based on content length, but can be adjusted.
            </p>
          </div>

          {/* Publishing Options */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-lg font-medium text-gray-900 mb-4">
              Publishing Options
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="publishNow"
                  type="radio"
                  checked={publishImmediately}
                  onChange={() => setPublishImmediately(true)}
                  className="h-4 w-4 text-primary-pink focus:ring-primary-pink"
                />
                <label htmlFor="publishNow" className="ml-2 block text-sm text-gray-900">
                  Publish immediately
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="publishLater"
                  type="radio"
                  checked={!publishImmediately}
                  onChange={() => setPublishImmediately(false)}
                  className="h-4 w-4 text-primary-pink focus:ring-primary-pink"
                />
                <label htmlFor="publishLater" className="ml-2 block text-sm text-gray-900">
                  Schedule for later
                </label>
              </div>

              {!publishImmediately && (
                <div className="ml-6">
                  <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Publication Date and Time
                  </label>
                  <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="publishDate"
                      type="datetime-local"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    The post will not be visible until this date and time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/content/blog')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-primary-dark-purple transition-colors duration-200 flex items-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBlogPostPage;