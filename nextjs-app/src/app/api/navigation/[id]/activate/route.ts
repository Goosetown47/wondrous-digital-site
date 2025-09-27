import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { navigationService } from '@/lib/services/navigation';
import { env } from '@/env.mjs';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/navigation/[id]/activate - Set a navigation menu as active
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  try {
    const cookieStore = await getBuildSafeCookieStore();
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await navigationService.setActive(id);
    
    return NextResponse.json({ success: true, message: 'Navigation menu activated' });
  } catch (error) {
    console.error('Error activating navigation menu:', error);
    return NextResponse.json(
      { error: 'Failed to activate navigation menu' },
      { status: 500 }
    );
  }
}