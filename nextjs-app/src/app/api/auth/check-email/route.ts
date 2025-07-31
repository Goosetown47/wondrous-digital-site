import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create admin client
    const supabaseAdmin = createAdminClient();

    // Check if user exists by listing users and filtering
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error checking email:', error);
      return NextResponse.json(
        { error: 'Failed to check email availability' },
        { status: 500 }
      );
    }

    // Check if any user has this email (case-insensitive)
    const emailExists = users.users.some(
      user => user.email?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({
      available: !emailExists,
      message: emailExists ? 'This email is already registered' : 'Email is available'
    });

  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}