/**
 * Build-Safe Cookie Utilities for Next.js 15
 *
 * Provides defensive programming for cookie operations that work correctly
 * in both build-time and runtime contexts. Addresses Next.js 15.4.2 build
 * failures during page data collection phase.
 */

type CookieValue = {
  name: string;
  value: string;
} | undefined;

type SafeCookieStore = {
  get: (name: string) => CookieValue;
  getAll: () => { name: string; value: string }[];
  set: (name: string, value: string, options?: any) => void;
};

/**
 * Creates a build-safe cookie store that handles both build-time and runtime contexts
 * @returns Promise<SafeCookieStore> - Safe wrapper around cookie operations
 */
export async function getBuildSafeCookieStore(): Promise<SafeCookieStore> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    // Validate that essential methods exist and are callable
    if (!cookieStore ||
        typeof cookieStore.get !== 'function' ||
        typeof cookieStore.getAll !== 'function') {
      console.log('[BUILD-SAFE] Using mock cookie store for build-time context');
      return createMockCookieStore();
    }

    return createSafeCookieStore(cookieStore);
  } catch (error) {
    console.log('[BUILD-SAFE] Cookie access failed, using mock store:', error);
    return createMockCookieStore();
  }
}

/**
 * Creates a safe wrapper around a real cookie store
 * @param cookieStore - The actual Next.js cookie store
 * @returns SafeCookieStore - Wrapped store with error handling
 */
function createSafeCookieStore(cookieStore: any): SafeCookieStore {
  return {
    get: (name: string) => {
      try {
        return cookieStore?.get?.(name) || undefined;
      } catch {
        return undefined;
      }
    },
    getAll: () => {
      try {
        const cookies = cookieStore?.getAll?.() || [];
        return cookies.filter((cookie: any) => cookie && cookie.name && cookie.value);
      } catch {
        return [];
      }
    },
    set: (name: string, value: string, options?: any) => {
      try {
        if (cookieStore?.set) {
          cookieStore.set({ name, value, ...options });
        }
      } catch {
        // Silently fail in build context - this is expected
      }
    }
  };
}

/**
 * Creates a mock cookie store for build-time contexts
 * @returns SafeCookieStore - Mock store that safely handles all operations
 */
function createMockCookieStore(): SafeCookieStore {
  return {
    get: () => undefined,
    getAll: () => [],
    set: () => {}, // No-op in build context
  };
}

/**
 * Detects if we're in a build-time context
 * @returns boolean - True if in build-time context
 */
export function isBuildTimeContext(): boolean {
  return process.env.NODE_ENV === 'production' &&
         typeof window === 'undefined' &&
         !process.env.VERCEL_URL;
}