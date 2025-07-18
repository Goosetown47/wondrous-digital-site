import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzcyODgsImV4cCI6MjA2NjkxMzI4OH0.S0nejPURa0JxoO3iAE82GjX019IbFYGjHeofMW8u9mE'
);

async function debugDatabase() {
  console.log('🔍 Debugging database structure and content...\n');
  
  try {
    // 1. Check what tables exist in the public schema
    console.log('1. Checking what tables exist...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
    } else {
      console.log('Available tables:', tables?.map(t => t.table_name));
    }

    // 2. Check projects table directly - just try to see if it exists
    console.log('\n2. Checking projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(3);
    
    if (projectsError) {
      console.error('Projects table error:', projectsError);
    } else {
      console.log('Projects found:', projects?.length || 0);
      if (projects && projects.length > 0) {
        console.log('Sample project:', projects[0]);
        console.log('Global nav field exists:', 'global_nav_section_id' in projects[0]);
        console.log('Global footer field exists:', 'global_footer_section_id' in projects[0]);
      }
    }

    // 3. Check for any page-related tables (maybe it's pages instead of sections)
    console.log('\n3. Checking for page-related data...');
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, page_name')
      .limit(3);
    
    if (pagesError) {
      console.error('Pages table error:', pagesError);
    } else {
      console.log('Pages found:', pages?.length || 0);
    }

    // 4. Check for any posts (since we saw blogService in supabase.js)
    console.log('\n4. Checking posts table...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title')
      .limit(3);
    
    if (postsError) {
      console.error('Posts table error:', postsError);
    } else {
      console.log('Posts found:', posts?.length || 0);
    }

    // 5. Try to get the current user to see if authentication is working
    console.log('\n5. Checking current user...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User error:', userError);
    } else {
      console.log('Current user:', user?.user ? 'Authenticated' : 'Not authenticated');
    }

  } catch (error) {
    console.error('Debug script error:', error);
  }
}

debugDatabase();