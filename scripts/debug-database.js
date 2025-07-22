import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function debugDatabase() {
  console.log('🔍 Debugging database structure and content...\n');
  
  try {
    // 1. Check if we can access projects table and see its structure
    console.log('1. Checking projects table structure...');
    try {
      const { data: projectsSchema, error: schemaError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      
      if (schemaError) {
        console.error('Error accessing projects table:', schemaError);
      } else {
        console.log('✅ Projects table accessible');
      }
    } catch (err) {
      console.error('Projects table error:', err);
    }

    // 2. Check projects table directly and specifically look for global navigation fields
    console.log('\n2. Checking projects table content and global nav fields...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, project_name, global_nav_section_id, global_footer_section_id')
      .limit(5);
    
    if (projectsError) {
      console.error('❌ Projects table error:', projectsError);
      console.log('Error details:', {
        message: projectsError.message,
        details: projectsError.details,
        hint: projectsError.hint,
        code: projectsError.code
      });
    } else {
      console.log('✅ Projects found:', projects?.length || 0);
      if (projects && projects.length > 0) {
        console.log('Sample projects with global nav fields:');
        projects.forEach((project, index) => {
          console.log(`  Project ${index + 1}:`, {
            id: project.id,
            name: project.project_name,
            global_nav_section_id: project.global_nav_section_id,
            global_footer_section_id: project.global_footer_section_id
          });
        });
      } else {
        console.log('❌ No projects found in database');
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

    // 5. Check what tables actually exist by trying common table names
    console.log('\n5. Checking for various table structures...');
    
    const tablesToCheck = ['page_sections', 'sections', 'section_templates', 'site_styles'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: Table exists with ${data?.length || 0} records (sample shown)`);
          if (data && data.length > 0) {
            console.log(`   Sample record keys:`, Object.keys(data[0]));
          }
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }

    // 6. Try to perform an update on projects table to test RLS policies
    console.log('\n6. Testing UPDATE permissions on projects table...');
    if (projects && projects.length > 0) {
      const testProject = projects[0];
      const { data: updateResult, error: updateError } = await supabase
        .from('projects')
        .update({ global_nav_section_id: null })
        .eq('id', testProject.id)
        .select();
      
      if (updateError) {
        console.error('❌ UPDATE permission error:', updateError);
        console.log('This might be the cause of the 400 error!');
      } else {
        console.log('✅ UPDATE permission works - RLS policies are correct');
      }
    }

    // 7. Try to get the current user to see if authentication is working
    console.log('\n7. Checking current user...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User error:', userError);
    } else {
      console.log('Current user:', user?.user ? 'Authenticated (service role)' : 'Not authenticated');
    }

  } catch (error) {
    console.error('Debug script error:', error);
  }
}

debugDatabase();