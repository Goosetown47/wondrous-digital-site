async function testEdgeFunction() {
  console.log('🚀 Manually triggering edge function...\n');
  
  try {
    const response = await fetch('https://bpdhbxvsguklkbusqtke.supabase.co/functions/v1/process-deployment-queue', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testEdgeFunction();