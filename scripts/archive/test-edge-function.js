#!/usr/bin/env node

// Test script to directly call the Edge Function
async function testEdgeFunction() {
  console.log('🧪 Testing Edge Function directly...\n');
  
  const edgeFunctionUrl = 'https://bpdhbxvsguklkbusqtke.supabase.co/functions/v1/process-deployment-queue';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM';
  
  try {
    console.log('Calling Edge Function at:', edgeFunctionUrl);
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log('\nResponse status:', response.status);
    console.log('Response status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('\nResponse body:');
    
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log(responseText);
    }
    
    if (!response.ok) {
      console.error('\n❌ Edge Function returned error status');
    } else {
      console.log('\n✅ Edge Function call successful');
    }
    
    console.log('\n📝 Additional Information:');
    console.log('- The cron job is scheduled to run every 2 minutes');
    console.log('- Check deployment_queue table to see if status changed');
    console.log('- Check deployment_logs table for processing logs');
    console.log('- Monitor Supabase Edge Function logs for errors');
    
  } catch (error) {
    console.error('\n❌ Failed to call Edge Function:', error);
  }
}

testEdgeFunction();