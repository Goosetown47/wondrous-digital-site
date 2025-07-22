#!/usr/bin/env node

/**
 * Check what assets are being generated in deployments
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDeploymentAssets() {
  console.log('🔍 Checking deployment assets...\n');
  
  // Find the dentist project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('project_name', 'Dentist Template')
    .single();
  
  if (projectError || !project) {
    console.error('❌ Error finding project:', projectError);
    return;
  }
  
  console.log('📋 Project Info:');
  console.log('   Name:', project.project_name);
  console.log('   Has site_styles:', !!project.site_styles);
  console.log('   Site styles count:', Object.keys(project.site_styles || {}).length);
  
  if (!project.site_styles || Object.keys(project.site_styles).length === 0) {
    console.log('\n⚠️  WARNING: Project has no site styles!');
    console.log('   This means CSS will only have default values.');
    console.log('   No custom colors, fonts, or styling will be applied.');
  }
  
  // Check recent deployments
  console.log('\n📦 Recent Deployments:');
  const { data: deployments } = await supabase
    .from('deployment_queue')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(3);
  
  deployments?.forEach((deployment, idx) => {
    console.log(`\n   Deployment ${idx + 1}:`);
    console.log('   - Status:', deployment.status);
    console.log('   - Created:', new Date(deployment.created_at).toLocaleString());
    
    if (deployment.payload?.exportResult?.assets) {
      const assets = deployment.payload.exportResult.assets;
      console.log('   - Assets:', assets.length);
      assets.forEach(asset => {
        console.log(`     • ${asset.path} (${asset.type})`);
      });
    } else {
      console.log('   - No asset info in payload');
    }
  });
  
  // Check deployment domain issue
  console.log('\n🌐 Domain Configuration:');
  console.log('   Project subdomain:', project.subdomain);
  console.log('   Deployment domain:', project.deployment_domain);
  console.log('   Netlify site ID:', project.netlify_site_id);
  
  if (!project.deployment_domain || project.deployment_domain === 'wondrousdigital.com') {
    console.log('\n⚠️  WARNING: Deployment domain not properly configured!');
    console.log('   This is why it\'s deploying to the main domain.');
    console.log('   Should be: ' + project.subdomain + '.wondrousdigital.com');
  }
}

// Run the check
checkDeploymentAssets().catch(console.error);