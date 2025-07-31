import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // User is authenticated, redirect to projects
    redirect('/projects');
  } else {
    // User is not authenticated, redirect to login
    redirect('/login');
  }
}