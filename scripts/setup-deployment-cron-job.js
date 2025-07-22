import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function setupCronJob() {
  console.log('🚀 Setting up deployment queue cron job...\n');
  
  try {
    // First, check if cron extension is enabled
    const { data: extensions, error: extError } = await supabase
      .rpc('pg_available_extensions')
      .eq('name', 'pg_cron');
    
    console.log('pg_cron extension available:', extensions?.length > 0);
    
    // Check if there's already a cron job
    const { data: existingJobs, error: jobError } = await supabase
      .from('cron_job')
      .select('*')
      .eq('jobname', 'process-deployment-queue');
    
    if (jobError) {
      console.log('Could not check existing jobs (table might not exist):', jobError.message);
    } else {
      console.log('Existing cron jobs found:', existingJobs?.length || 0);
      if (existingJobs && existingJobs.length > 0) {
        console.log('Existing job:', existingJobs[0]);
      }
    }
    
    // Try to create the cron job using SQL
    console.log('\nAttempting to create cron job via SQL...');
    
    const sql = `
      -- Enable pg_cron if not already enabled
      CREATE EXTENSION IF NOT EXISTS pg_cron;
      
      -- Unschedule any existing job
      DO $$
      BEGIN
        PERFORM cron.unschedule('process-deployment-queue');
      EXCEPTION
        WHEN OTHERS THEN
          NULL;
      END;
      $$;
      
      -- Create the cron job
      SELECT cron.schedule(
        'process-deployment-queue',
        '*/2 * * * *',
        $$
        SELECT net.http_post(
          url := 'https://bpdhbxvsguklkbusqtke.supabase.co/functions/v1/process-deployment-queue',
          headers := jsonb_build_object(
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM',
            'Content-Type', 'application/json'
          ),
          body := '{}'::jsonb,
          timeout_milliseconds := 60000
        );
        $$
      );
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error creating cron job:', error);
      console.log('\nNote: You may need to set up the cron job manually in the Supabase Dashboard:');
      console.log('1. Go to Database > Cron Jobs');
      console.log('2. Click "Create a new cron job"');
      console.log('3. Use these settings:');
      console.log('   - Name: process-deployment-queue');
      console.log('   - Schedule: */2 * * * *');
      console.log('   - Command: SELECT net.http_post(...)');
      console.log('   - Copy the full SQL command from the migration file');
    } else {
      console.log('✅ Cron job created successfully!');
      console.log('The deployment queue will now be processed automatically every 2 minutes.');
    }
    
    // Verify the job was created
    const { data: newJobs } = await supabase
      .from('cron_job')
      .select('*')
      .eq('jobname', 'process-deployment-queue');
    
    if (newJobs && newJobs.length > 0) {
      console.log('\n✅ Verified: Cron job is registered in the database');
      console.log('Job details:', newJobs[0]);
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

// Alternative: Direct SQL execution function
async function executeSQLDirectly() {
  console.log('\n\nTrying alternative approach with direct SQL execution...');
  
  const { data, error } = await supabase.rpc('exec_raw_sql', {
    query: `
      SELECT cron.schedule(
        'process-deployment-queue',
        '*/2 * * * *',
        'SELECT 1'
      );
    `
  });
  
  if (error) {
    console.log('Direct SQL also failed:', error.message);
    console.log('\nPlease use the Supabase Dashboard to create the cron job manually.');
  } else {
    console.log('Basic cron job created, now updating with actual command...');
  }
}

setupCronJob().then(() => {
  console.log('\n\n📝 Manual Setup Instructions:');
  console.log('If the automatic setup failed, you can create the cron job manually:');
  console.log('\n1. Go to: https://supabase.com/dashboard/project/bpdhbxvsguklkbusqtke/database/cron-jobs');
  console.log('2. Click "New cron job"');
  console.log('3. Fill in:');
  console.log('   - Name: process-deployment-queue');
  console.log('   - Schedule: */2 * * * * (every 2 minutes)');
  console.log('   - Command: Copy from the migration file');
});