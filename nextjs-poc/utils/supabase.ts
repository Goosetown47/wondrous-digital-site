import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yrbiwpjuikqjdedqehvs.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyYml3cGp1aWtxamRlZHFlaHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNTEyNjgsImV4cCI6MjA0NjkyNzI2OH0.IQXlw98CKxqOJU8kfmLdXzfr2wcqQKJbiOqV2jnuwGM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);