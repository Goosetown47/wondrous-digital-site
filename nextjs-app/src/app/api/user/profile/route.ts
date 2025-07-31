import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { display_name, phone, metadata = {} } = body;

    // Use service role to update user profile
    const serviceClient = createAdminClient();

    // Update or create user profile
    const { error: profileError } = await serviceClient
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        display_name,
        phone,
        metadata: {
          ...metadata,
          updated_via: 'onboarding',
          updated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unexpected error in profile update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}