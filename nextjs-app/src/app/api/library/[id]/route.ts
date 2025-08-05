import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  console.log('🔍 [API/Library] Fetching library item:', id);

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
      console.log('❌ [API/Library] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();
    
    // Fetch the library item using service role
    const { data: item, error } = await serviceClient
      .from('library_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('❌ [API/Library] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!item) {
      console.log('❌ [API/Library] Item not found:', id);
      return NextResponse.json({ error: 'Library item not found' }, { status: 404 });
    }

    console.log('✅ [API/Library] Item found:', item.name);

    // Increment usage count using service role
    const newUsageCount = (item.usage_count || 0) + 1;
    const { error: updateError } = await serviceClient
      .from('library_items')
      .update({ usage_count: newUsageCount })
      .eq('id', id);
    
    if (updateError) {
      console.error('⚠️ [API/Library] Error updating usage count:', updateError);
      // Don't fail the request if usage count update fails
    } else {
      console.log(`✅ [API/Library] Usage count incremented for ${item.name}: ${item.usage_count || 0} → ${newUsageCount}`);
    }

    return NextResponse.json(item);
    
  } catch (error) {
    console.error('❌ [API/Library] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch library item';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}