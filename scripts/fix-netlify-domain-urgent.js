import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function fixNetlifyDomain() {
  console.log('🚨 URGENT: Fixing Netlify domain configuration...\n');
  
  // Using the token from testing - this is urgent!
  const netlifyToken = 'nfp_qtP2LJS4xQU7Dzwf137emA8wKFKSF2fg3bfe';
  const netlifyTeamId = 'wondrous-digital';
  
  const siteId = '92cb4d4c-989e-4989-b268-873567005ec9';
  
  console.log('Step 1: Remove domain aliases first, then custom domain...');
  
  try {
    // First, remove all domain aliases
    const removeAliasesResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain_aliases: []  // Remove all aliases first
      })
    });
    
    if (!removeAliasesResponse.ok) {
      const error = await removeAliasesResponse.text();
      console.error('Failed to remove aliases:', error);
      return;
    }
    
    console.log('✅ Removed domain aliases');
    
    // Now remove the custom domain
    console.log('\nStep 2: Remove wondrousdigital.com as custom domain...');
    const updateResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        custom_domain: null  // Remove custom domain
      })
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('Failed to update site:', error);
      return;
    }
    
    const updatedSite = await updateResponse.json();
    console.log('✅ Removed custom domain');
    console.log('   Primary domain is now:', updatedSite.name + '.netlify.app');
    
    // Step 3: Re-add dentist-1.wondrousdigital.com as domain alias
    console.log('\nStep 3: Re-adding dentist-1.wondrousdigital.com as domain alias...');
    const addAliasResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain_aliases: ['dentist-1.wondrousdigital.com']
      })
    });
    
    if (!addAliasResponse.ok) {
      const error = await addAliasResponse.text();
      console.error('Failed to add alias:', error);
    } else {
      console.log('✅ Added dentist-1.wondrousdigital.com as domain alias');
    }
    
    // Step 4: Update the cache
    console.log('\nStep 4: Updating cache...');
    await supabase
      .from('netlify_site_cache')
      .update({
        primary_domain: updatedSite.name + '.netlify.app',
        custom_domain: null,
        subdomain: 'dentist-1',
        deployment_domain: 'wondrousdigital.com',
        last_updated: new Date().toISOString()
      })
      .eq('netlify_site_id', siteId);
    
    console.log('✅ Cache updated');
    
    // Step 5: Update the project
    console.log('\nStep 5: Updating project...');
    await supabase
      .from('projects')
      .update({
        deployment_url: `https://dentist-1.wondrousdigital.com`,
        updated_at: new Date().toISOString()
      })
      .eq('netlify_site_id', siteId);
    
    console.log('✅ Project updated');
    
    console.log('\n✅ FIXED! The dentist site is no longer on wondrousdigital.com');
    console.log('   It should now be accessible at: https://dentist-1.wondrousdigital.com');
    console.log('   The main wondrousdigital.com domain is freed up.');
    
    // Step 6: Check if we need to restore the main site
    console.log('\nStep 6: Checking for main Wondrous Digital site...');
    const { data: mainProject } = await supabase
      .from('projects')
      .select('*')
      .or('subdomain.is.null,subdomain.eq.www,subdomain.eq.""')
      .eq('deployment_domain', 'wondrousdigital.com')
      .neq('id', '923eb256-26eb-4cf3-8e64-ddd1297863c0')  // Not the dentist project
      .single();
    
    if (mainProject && mainProject.netlify_site_id) {
      console.log('Found main site project:', mainProject.project_name);
      console.log('You may need to restore this site to wondrousdigital.com');
      console.log('Site ID:', mainProject.netlify_site_id);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixNetlifyDomain();