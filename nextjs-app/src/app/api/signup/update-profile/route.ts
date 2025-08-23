import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeFormData } from '@/lib/security/sanitize';

export async function POST(request: Request) {
  try {
    const rawData = await request.json();
    
    // Sanitize input data
    const {
      avatarUrl,
      firstName,
      lastName,
      userHandle,
      phoneNumber,
      jobTitle,
      timezone,
      location,
      notes,
    } = sanitizeFormData(rawData, {
      avatarUrl: 'url',
      firstName: 'plain',
      lastName: 'plain',
      userHandle: 'plain',
      phoneNumber: 'plain',
      jobTitle: 'plain',
      timezone: 'plain',
      location: 'plain',
      notes: 'plain',
    });
    
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First and last name are required' },
        { status: 400 }
      );
    }

    // Use regular client to get the authenticated user
    const authClient = await createSupabaseServerClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Use admin client for database operations to bypass RLS
    const adminClient = createAdminClient();
    
    // Check if user handle is already taken (if provided)
    if (userHandle) {
      const { data: existingHandle } = await adminClient
        .from('user_profiles')
        .select('user_id')
        .eq('user_handle', userHandle)
        .neq('user_id', user.id)
        .single();
      
      if (existingHandle) {
        return NextResponse.json(
          { error: 'This user handle is already taken' },
          { status: 400 }
        );
      }
    }
    
    // Build the profile data
    const profileData = {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      display_name: `${firstName} ${lastName}`,
      user_handle: userHandle || null,
      phone_number: phoneNumber || null,
      job_title: jobTitle || null,
      timezone: timezone || 'America/New_York',
      location: location || null,
      notes: notes || null,
      avatar_url: avatarUrl || null,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    };
    
    // Upsert the user profile (insert or update)
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json(
        { error: profileError.message || 'Failed to update profile' },
        { status: 500 }
      );
    }
    
    // Also update the auth user metadata for display name
    const { error: metadataError } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          full_name: `${firstName} ${lastName}`,
          display_name: `${firstName} ${lastName}`,
        }
      }
    );
    
    if (metadataError) {
      console.error('Metadata update error:', metadataError);
      // Don't fail the request if metadata update fails
    }
    
    console.log(`[Signup] Profile updated successfully for user ${user.email}`);
    
    return NextResponse.json({
      profile,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}