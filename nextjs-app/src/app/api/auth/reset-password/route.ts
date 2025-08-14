import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/services/email';
import { PasswordResetEmail } from '@/emails/password-reset';
import { z } from 'zod';
import { render } from '@react-email/components';
import React from 'react';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Schema for request validation
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

// Rate limiting helper
function checkRateLimit(identifier: string, maxAttempts: number = 3, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Check rate limiting
    if (!checkRateLimit(email, 3, 3600000)) { // 3 attempts per hour
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = createAdminClient();

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error listing users:', userError);
      return NextResponse.json(
        { error: 'An error occurred. Please try again.' },
        { status: 500 }
      );
    }

    const user = userData.users.find(u => u.email === email);

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate password reset link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
      }
    });

    if (linkError || !linkData) {
      console.error('Error generating reset link:', linkError);
      return NextResponse.json(
        { error: 'Failed to generate password reset link' },
        { status: 500 }
      );
    }

    // Get request IP for audit logging
    const requestIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'Unknown';

    // Get user's name if available
    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Render email template
    const emailHtml = await render(
      PasswordResetEmail({
        userName: profile?.full_name || undefined,
        resetLink: linkData.properties.action_link,
        expiresIn: '1 hour',
      }) as React.ReactElement
    );

    // Send email via Resend
    const emailResult = await sendEmail({
      to: email,
      from: 'Wondrous Digital <noreply@wondrousdigital.com>',
      subject: 'Reset your Wondrous Digital password',
      html: emailHtml,
      headers: {
        'X-Entity-Ref-ID': user.id,
        'X-Email-Type': 'password-reset',
      },
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    // Log the password reset request for security monitoring
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'password_reset_requested',
          resource_type: 'auth',
          resource_id: user.id,
          ip_address: requestIp,
          user_agent: request.headers.get('user-agent') || 'Unknown',
          metadata: {
            email: email,
            timestamp: new Date().toISOString(),
          },
        });
    } catch (auditError) {
      // Don't fail the request if audit logging fails
      console.error('Failed to log password reset request:', auditError);
    }

    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}