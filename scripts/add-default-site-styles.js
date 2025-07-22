#!/usr/bin/env node

/**
 * Add default site styles to the dentist project
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

// Default site styles based on the PageBuilder pink theme
const defaultSiteStyles = {
  // Colors
  '--color-primary': '#F867AC',
  '--color-primary-hover': '#E84D98',
  '--color-primary-text': '#FFFFFF',
  '--color-secondary': '#6B7280',
  '--color-secondary-hover': '#4B5563',
  '--color-secondary-text': '#FFFFFF',
  '--color-tertiary': '#FFFFFF',
  '--color-tertiary-hover': '#F3F4F6',
  '--color-tertiary-text': '#111827',
  '--color-text': '#374151',
  '--color-heading': '#111827',
  '--color-background': '#FFFFFF',
  
  // Typography
  '--font-body': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  '--font-heading': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  '--font-size-body': '1rem',
  '--font-size-h1': '3rem',
  '--font-size-h2': '2.25rem',
  '--font-size-h3': '1.875rem',
  '--font-weight-heading': '700',
  '--line-height-body': '1.6',
  '--line-height-heading': '1.2',
  
  // Buttons
  '--button-padding-x': '1.5rem',
  '--button-padding-y': '0.75rem',
  '--button-border-radius': '9999px',
  '--button-font-size': '1rem',
  '--button-font-weight': '500',
  '--primary-button-bg': '#F867AC',
  '--primary-button-text': '#FFFFFF',
  '--primary-button-bg-hover': '#E84D98',
  '--secondary-button-bg': '#6B7280',
  '--secondary-button-text': '#FFFFFF',
  '--secondary-button-bg-hover': '#4B5563',
  '--tertiary-button-bg': '#FFFFFF',
  '--tertiary-button-text': '#111827',
  '--tertiary-button-border': '#E5E7EB',
  
  // Layout
  '--container-max-width': '1200px',
  '--section-padding-y': '4rem',
  '--grid-gap': '2rem',
  
  // Cards
  '--card-background': '#FFFFFF',
  '--card-border-color': '#E5E7EB',
  '--card-border-radius': '0.5rem',
  '--card-padding': '1.5rem',
  '--card-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  
  // Navigation
  '--nav-background': '#FFFFFF',
  '--nav-link-color': '#374151',
  '--nav-link-hover': '#F867AC',
  
  // Features
  '--feature-icon-size': '40px',
  
  // Text alignment and spacing
  '--text-align-center': 'center',
  '--mb-4': '1rem',
  '--tagline-font-size': '0.875rem',
  '--tagline-text-transform': 'uppercase',
  '--tagline-letter-spacing': '0.05em'
};

async function addDefaultSiteStyles() {
  console.log('🎨 Adding default site styles to Dentist Template...\n');
  
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
  
  console.log('📋 Found project:', project.project_name);
  console.log('   Current site_styles:', !!project.site_styles);
  
  // Update with default styles
  const { error: updateError } = await supabase
    .from('projects')
    .update({ 
      site_styles: defaultSiteStyles,
      updated_at: new Date().toISOString()
    })
    .eq('id', project.id);
  
  if (updateError) {
    console.error('❌ Error updating site styles:', updateError);
  } else {
    console.log('✅ Successfully added default site styles!');
    console.log('   Total style properties:', Object.keys(defaultSiteStyles).length);
    console.log('\n🎨 Key styles added:');
    console.log('   - Primary color: Pink (#F867AC)');
    console.log('   - Button radius: Fully rounded (9999px)');
    console.log('   - Typography: System fonts');
    console.log('   - Layout: 1200px max width');
    console.log('   - Section padding: 4rem');
  }
}

// Run the update
addDefaultSiteStyles().catch(console.error);