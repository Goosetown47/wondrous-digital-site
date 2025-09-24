import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';
import { getDetailedComponentUsage } from '@/lib/services/component-usage-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  console.log('🔍 [API/CoreComponents/Usage] Getting usage for component:', name);

  try {
    // Verify authentication
    const cookieStore = await cookies();
    const authClient = createServerClient(
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
              // Ignore cookie setting errors
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser();

    if (userError || !user) {
      console.log('❌ [API/CoreComponents/Usage] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/CoreComponents/Usage] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/CoreComponents/Usage] Access denied - user is not admin or staff');
      return NextResponse.json({
        error: 'Access denied. Admin or staff role required.'
      }, { status: 403 });
    }

    // Get detailed usage information
    const usage = await getDetailedComponentUsage(name);

    console.log('✅ [API/CoreComponents/Usage] Usage retrieved:', {
      component: name,
      totalUsage: usage.totalUsage,
      draftCount: usage.draftCount,
      libraryCount: usage.libraryCount
    });

    return NextResponse.json(usage);

  } catch (error) {
    console.error('❌ [API/CoreComponents/Usage] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}