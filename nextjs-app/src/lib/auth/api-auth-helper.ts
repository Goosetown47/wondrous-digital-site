/**
 * API Authentication Helper
 * Provides reusable authentication and authorization checks for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/permissions/server-checks';

export interface AuthResult {
  authenticated: boolean;
  isAdmin: boolean;
  userId?: string;
  error?: NextResponse;
}

/**
 * Check if the request is from an authenticated admin user
 *
 * @param _request - Next.js request object (unused but kept for future extensions)
 * @returns AuthResult with authentication status and optional error response
 *
 * @example
 * ```typescript
 * const auth = await checkAdminAuth(request);
 * if (auth.error) return auth.error;
 * // Proceed with admin-only logic using auth.userId
 * ```
 */
export async function checkAdminAuth(_request: NextRequest): Promise<AuthResult> {
  try {
    // Check authentication
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        authenticated: false,
        isAdmin: false,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      };
    }

    // Check admin role
    const isUserAdmin = await isAdminServer(user.id);
    if (!isUserAdmin) {
      return {
        authenticated: true,
        isAdmin: false,
        userId: user.id,
        error: NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      };
    }

    return {
      authenticated: true,
      isAdmin: true,
      userId: user.id
    };
  } catch (error) {
    console.error('Authentication check failed:', error);
    return {
      authenticated: false,
      isAdmin: false,
      error: NextResponse.json(
        { error: 'Authentication check failed' },
        { status: 500 }
      )
    };
  }
}