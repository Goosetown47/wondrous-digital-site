#!/usr/bin/env node

/**
 * Debug the complete deployment flow
 * This script traces what happens during deployment to understand why content isn't appearing
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Use hardcoded values for debugging script
const supabaseUrl = 'https://bpdhbxvsguklkbusqtke.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDeploymentFlow() {
  console.log('🔍 DEBUGGING DEPLOYMENT FLOW FOR DENTIST PROJECT\n');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Find the dentist project
    console.log('\n📁 STEP 1: Finding Dentist Project...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_name', 'Dentist Template')
      .single();
    
    if (projectError || !project) {
      console.error('❌ Error finding project:', projectError);
      return;
    }
    
    console.log('✅ Found project:');
    console.log('   - ID:', project.id);
    console.log('   - Name:', project.project_name);
    console.log('   - Subdomain:', project.subdomain);
    console.log('   - Deployment Status:', project.deployment_status);
    console.log('   - Netlify Site ID:', project.netlify_site_id);
    
    // Step 2: Check pages and their content
    console.log('\n📄 STEP 2: Checking Pages and Content...');
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', project.id)
      .order('order_index');
    
    if (pagesError) {
      console.error('❌ Error fetching pages:', pagesError);
      return;
    }
    
    console.log(`✅ Found ${pages?.length || 0} pages:`);
    
    pages?.forEach((page, idx) => {
      console.log(`\n   Page ${idx + 1}: ${page.page_name || 'Untitled'}`);
      console.log('   - ID:', page.id);
      console.log('   - Slug:', page.slug);
      console.log('   - Is Homepage:', page.is_homepage);
      console.log('   - Status:', page.status);
      console.log('   - Has sections array:', !!page.sections);
      console.log('   - Number of sections:', page.sections?.length || 0);
      
      if (page.sections && page.sections.length > 0) {
        console.log('   - Section types:', page.sections.map(s => s.type).join(', '));
        
        // Check first section's content structure
        const firstSection = page.sections[0];
        console.log(`\n   📦 First section (${firstSection.type}) content structure:`);
        console.log('   - Has content object:', !!firstSection.content);
        console.log('   - Content keys:', Object.keys(firstSection.content || {}).join(', '));
        
        // Sample some content
        if (firstSection.content) {
          const sampleField = Object.keys(firstSection.content)[0];
          if (sampleField) {
            console.log(`   - Sample field "${sampleField}":`, JSON.stringify(firstSection.content[sampleField], null, 2));
          }
        }
      }
    });
    
    // Step 3: Check what the deployment engine would receive
    console.log('\n🚀 STEP 3: Simulating Deployment Engine Data...');
    console.log('\nWhat the deployment engine would receive:');
    console.log('- Project ID:', project.id);
    console.log('- Project has site_styles:', !!project.site_styles);
    console.log('- Number of style properties:', Object.keys(project.site_styles || {}).length);
    
    // Step 4: Check deployment queue for recent deployments
    console.log('\n📊 STEP 4: Checking Recent Deployments...');
    const { data: recentDeployments, error: deployError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (deployError) {
      console.error('❌ Error fetching deployments:', deployError);
    } else {
      console.log(`✅ Found ${recentDeployments?.length || 0} recent deployments:`);
      
      recentDeployments?.forEach((deployment, idx) => {
        console.log(`\n   Deployment ${idx + 1}:`);
        console.log('   - ID:', deployment.id);
        console.log('   - Status:', deployment.status);
        console.log('   - Created:', new Date(deployment.created_at).toLocaleString());
        console.log('   - Has logs:', !!deployment.logs);
        console.log('   - Has error:', !!deployment.error);
        console.log('   - Live URL:', deployment.live_url);
        
        if (deployment.payload) {
          console.log('   - Payload keys:', Object.keys(deployment.payload).join(', '));
        }
      });
    }
    
    // Step 5: Analyze content format
    console.log('\n🔎 STEP 5: Analyzing Content Format...');
    if (pages && pages.length > 0 && pages[0].sections) {
      const heroSection = pages[0].sections.find(s => s.type === 'hero');
      if (heroSection && heroSection.content) {
        console.log('\n📝 Hero Section Content Analysis:');
        console.log('Content structure:', JSON.stringify(heroSection.content, null, 2));
        
        // Check for field name mismatches
        console.log('\n⚠️  Potential field name issues:');
        const hasHeadline = 'headline' in heroSection.content;
        const hasHeroHeading = 'heroHeading' in heroSection.content;
        const hasDescription = 'description' in heroSection.content;
        const hasHeroSubheading = 'heroSubheading' in heroSection.content;
        
        console.log('- Has "headline":', hasHeadline);
        console.log('- Has "heroHeading":', hasHeroHeading);
        console.log('- Has "description":', hasDescription);
        console.log('- Has "heroSubheading":', hasHeroSubheading);
        
        if (!hasHeadline && !hasHeroHeading) {
          console.log('❌ Missing both headline and heroHeading!');
        }
      }
    }
    
    // Step 6: Check page_sections table (legacy)
    console.log('\n📋 STEP 6: Checking Legacy page_sections Table...');
    const { data: pageSections, error: sectionsError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('project_id', project.id)
      .limit(5);
    
    if (sectionsError) {
      console.error('❌ Error fetching page_sections:', sectionsError);
    } else {
      console.log(`✅ Found ${pageSections?.length || 0} sections in page_sections table`);
      if (pageSections && pageSections.length > 0) {
        console.log('⚠️  WARNING: Legacy page_sections exist - deployment might use these instead!');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY:');
    console.log('- Project exists and is marked as deployed');
    console.log(`- ${pages?.length || 0} pages with embedded sections`);
    console.log(`- ${pageSections?.length || 0} legacy page_sections (potential conflict)`);
    console.log('- Content structure appears to be using PageBuilder format');
    console.log('\n💡 Next: Check deployment engine render functions for field mapping issues');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug script
debugDeploymentFlow().catch(console.error);