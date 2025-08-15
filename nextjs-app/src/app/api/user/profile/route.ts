import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist yet
        return NextResponse.json({ profile: null });
      }
      throw profileError;
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    
    // Ensure user_id matches authenticated user
    const profileData = {
      ...body,
      user_id: user.id,
      profile_completed: body.profile_completed ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Use admin client to bypass RLS for initial creation
    const adminClient = createAdminClient();
    
    // Insert or update profile
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating/updating profile:', profileError);
      throw profileError;
    }

    // Also update auth user metadata for consistency
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          display_name: profileData.display_name,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url,
        }
      }
    );

    if (updateError) {
      console.error('Error updating auth metadata:', updateError);
      // Don't fail the request if metadata update fails
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to create/update profile' },
      { status: 500 }
    );
  }
}

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