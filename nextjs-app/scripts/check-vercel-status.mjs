#!/usr/bin/env node
/**
 * Check Vercel configuration status
 */

import fetch from 'node-fetch';

async function checkVercelStatus() {
  try {
    console.log('🔍 Checking Vercel configuration status...\n');
    
    const port = process.env.PORT || 3003;
    const response = await fetch(`http://localhost:${port}/api/domains/vercel-status`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.configured) {
      console.log('\n✅ Vercel is configured and ready!');
    } else {
      console.log('\n⚠️  Vercel is not configured');
      console.log('   Add these to your .env.local:');
      console.log('   - VERCEL_API_TOKEN');
      console.log('   - VERCEL_PROJECT_ID');
      console.log('   - VERCEL_TEAM_ID (optional)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(`\nMake sure the development server is running on port ${process.env.PORT || 3003}`);
  }
}

checkVercelStatus();