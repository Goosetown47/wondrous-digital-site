import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { env } from '@/env.mjs';

/**
 * Server-side authentication and role checks for Next.js App Router
 */

export async function getServerUser() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function requireAuth() {
  const user = await getServerUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

export async function requireAdminOrStaff() {
  const user = await requireAuth();
  
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  );

  // Check if user is admin or staff
  const { data: platformRole } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('account_id', '00000000-0000-0000-0000-000000000000')
    .single();

  if (!platformRole || (platformRole.role !== 'admin' && platformRole.role !== 'staff')) {
    redirect('/dashboard?error=unauthorized');
  }

  return { user, role: platformRole.role };
}

export async function requireAdmin() {
  const user = await requireAuth();
  
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  );

  // Check if user is admin
  const { data: platformRole } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('account_id', '00000000-0000-0000-0000-000000000000')
    .single();

  if (!platformRole || platformRole.role !== 'admin') {
    redirect('/dashboard?error=admin-only');
  }

  return user;
}