import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Blog-related functions
export const blogService = {
  // Get all published posts with pagination
  async getPosts(page = 1, limit = 12) {
    console.log('blogService.getPosts called with:', { page, limit });
    
    const from = (page - 1) * limit
    const to = from + limit - 1
    console.log('Query range:', { from, to });

    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(from, to)

    console.log('Supabase response:', { data, error, count });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return {
      posts: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    }
  },

  // Get a single post by slug
  async getPostBySlug(slug) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  },

  // Get featured posts (you can modify this logic as needed)
  async getFeaturedPosts(limit = 3) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}