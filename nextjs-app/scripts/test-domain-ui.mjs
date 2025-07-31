#!/usr/bin/env node
/**
 * Test script to verify domain UI components are working
 */

import { chromium } from 'playwright';

async function testDomainUI() {
  console.log('🧪 Testing Domain UI Components\n');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to project settings
    console.log('1️⃣ Navigating to project settings...');
    await page.goto('http://localhost:3000/app/projects');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    console.log('✅ Page loaded');
    
    // Look for domain settings
    console.log('2️⃣ Looking for domain settings...');
    
    // Keep browser open for manual inspection
    console.log('\n📋 Browser is open for manual inspection');
    console.log('   - Check if Vercel status alert is visible');
    console.log('   - Verify domain time estimation shows');
    console.log('   - Test troubleshooting guide');
    console.log('\nPress Ctrl+C to close browser and exit');
    
    // Wait indefinitely
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testDomainUI().catch(console.error);