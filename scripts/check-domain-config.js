#!/usr/bin/env node

/**
 * Check domain configuration for the dentist project
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDomainConfig() {
  console.log('🌐 Checking domain configuration...\n');
  
  // Get all projects to see domain patterns
  const { data: projects, error } = await supabase
    .from('projects')
    .select('project_name, subdomain, deployment_domain, deployment_url, netlify_site_id, netlify_primary_domain')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }
  
  console.log('Recent projects and their domains:\n');
  
  projects?.forEach(project => {
    console.log(`📋 ${project.project_name}`);
    console.log('   Subdomain:', project.subdomain);
    console.log('   Deployment domain:', project.deployment_domain);
    console.log('   Deployment URL:', project.deployment_url);
    console.log('   Netlify site ID:', project.netlify_site_id);
    console.log('   Netlify primary domain:', project.netlify_primary_domain);
    
    if (project.deployment_domain === 'wondrousdigital.com' || 
        project.netlify_primary_domain === 'wondrousdigital.com') {
      console.log('   ⚠️  WARNING: Using main domain!');
    }
    console.log('');
  });
  
  // Check specifically for dentist project
  const { data: dentist } = await supabase
    .from('projects')
    .select('*')
    .eq('project_name', 'Dentist Template')
    .single();
  
  if (dentist) {
    console.log('\n🦷 Dentist Template Configuration:');
    console.log('   What it SHOULD be:');
    console.log('   - Deployment domain: dentist-1.wondrousdigital.com');
    console.log('   - Netlify primary domain: dentist-1.wondrousdigital.com');
    console.log('\n   What it ACTUALLY is:');
    console.log('   - Deployment domain:', dentist.deployment_domain);
    console.log('   - Netlify primary domain:', dentist.netlify_primary_domain);
    console.log('   - Deployment URL:', dentist.deployment_url);
    
    if (dentist.netlify_primary_domain === 'wondrousdigital.com') {
      console.log('\n   ❌ This is why it\'s overwriting the main site!');
      console.log('   The Netlify site is configured with the wrong domain.');
    }
  }
}

// Run the check
checkDomainConfig().catch(console.error);