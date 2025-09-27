import { createServerClient, type CookieOptions } from '@supabase/ssr';
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