import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/env.mjs';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';

export async function createSupabaseServerClient() {
  const cookieStore = await getBuildSafeCookieStore();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Silently fail in build context
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch {
            // Silently fail in build context
          }
        },
      },
    }
  );
}

/**
 * Create Supabase client with service role key (bypasses RLS)
 *
 * ⚠️ WARNING: This client bypasses Row Level Security!
 * Only use after proper authorization checks with user client.
 *
 * Common pattern:
 * 1. Use createSupabaseServerClient() for auth/authorization
 * 2. Use createSupabaseServiceClient() for admin operations
 */
export function createSupabaseServiceClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}