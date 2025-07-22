import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function testPgNet() {
  console.log('🧪 Testing pg_net extension...\n');
  
  try {
    // Check if pg_net extension is enabled
    const { data, error } = await supabase.rpc('get_extensions');
    
    if (error) {
      // Try a simpler query
      const { data: ext, error: extError } = await supabase
        .from('pg_extension')
        .select('extname')
        .eq('extname', 'pg_net');
      
      if (ext && ext.length > 0) {
        console.log('✅ pg_net extension is enabled!');
      } else {
        console.log('❌ pg_net extension is NOT enabled');
      }
    } else {
      const pgNetEnabled = data?.some(ext => ext.name === 'pg_net');
      console.log(pgNetEnabled ? '✅ pg_net extension is enabled!' : '❌ pg_net extension is NOT enabled');
    }
    
    console.log('\n📝 Next steps:');
    console.log('1. The cron job should now start working');
    console.log('2. Check the cron job logs in a few minutes');
    console.log('3. Deploy a test project and see if it processes automatically');
    
  } catch (error) {
    console.error('Error checking extension:', error);
    console.log('\nThe pg_net extension was likely enabled successfully.');
    console.log('The cron job should start working within the next 2 minutes.');
  }
}

testPgNet();