import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testDentistExport() {
  console.log('🦷 Testing static export for Dentist Template...\n');
  
  try {
    // Find the dentist template project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('subdomain', 'dentist-1')
      .single();
    
    if (projectError || !project) {
      console.error('❌ Could not find dentist-1 project:', projectError);
      return;
    }
    
    console.log('✅ Found project:', project.project_name);
    console.log('   ID:', project.id);
    
    // Get all sections for the project (both page-level and project-level)
    const { data: allSections, error: sectionsError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', project.id)
      .order('order_index', { ascending: true });
    
    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
    }
    
    console.log(`\n📊 Section Analysis:`);
    console.log(`   Total sections: ${allSections?.length || 0}`);
    
    const projectLevelSections = allSections?.filter(s => !s.page_id) || [];
    const pageLevelSections = allSections?.filter(s => s.page_id) || [];
    
    console.log(`   Project-level sections: ${projectLevelSections.length}`);
    console.log(`   Page-level sections: ${pageLevelSections.length}`);
    
    // Show the global nav section content
    if (project.global_nav_section_id) {
      const navSection = allSections?.find(s => s.id === project.global_nav_section_id);
      if (navSection) {
        console.log('\n🧭 Global Navigation Section:');
        console.log(JSON.stringify(navSection.content, null, 2));
      }
    }
    
    // Generate static site using deployment engine
    console.log('\n🔧 Generating static site...');
    const deploymentEngine = new NetlifyDeploymentEngine();
    const exportResult = await deploymentEngine.generateStaticSite(project.id);
    
    console.log('\n📦 Export Result:');
    console.log(`   Pages: ${exportResult.pages.length}`);
    console.log(`   Assets: ${exportResult.assets.length}`);
    
    // Save the export locally for inspection
    const exportDir = path.join(process.cwd(), 'temp-export', 'dentist-template');
    await fs.mkdir(exportDir, { recursive: true });
    
    // Save pages
    for (const page of exportResult.pages) {
      const filePath = path.join(exportDir, page.filename);
      await fs.writeFile(filePath, page.content);
      console.log(`   Saved: ${page.filename} (${page.content.length} bytes)`);
    }
    
    // Save assets
    for (const asset of exportResult.assets) {
      const assetPath = path.join(exportDir, asset.path);
      await fs.mkdir(path.dirname(assetPath), { recursive: true });
      await fs.writeFile(assetPath, asset.content);
      console.log(`   Saved: ${asset.path} (${asset.type})`);
    }
    
    console.log(`\n✅ Export saved to: ${exportDir}`);
    console.log('   You can open index.html in a browser to view the result');
    
    // Show a snippet of the index.html
    const indexPage = exportResult.pages.find(p => p.is_homepage);
    if (indexPage) {
      console.log('\n📄 Index.html snippet:');
      console.log(indexPage.content.substring(0, 500) + '...');
    }
    
  } catch (error) {
    console.error('Export error:', error);
  }
}

testDentistExport();