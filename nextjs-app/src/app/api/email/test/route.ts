import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/services/email';
import { InvitationEmail } from '@/emails/invitation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createElement } from 'react';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test emails are not allowed in production' },
        { status: 403 }
      );
    }
    
    // Check if user is authenticated
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get test email details from request body
    const body = await request.json();
    const { to, type = 'invitation' } = body;
    
    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (type) {
      case 'invitation':
        // Send test invitation email
        result = await sendEmail({
          to,
          subject: 'Test Invitation Email',
          react: createElement(InvitationEmail, {
            inviteeName: to.split('@')[0],
            inviterName: user.email?.split('@')[0] || 'Test User',
            inviterEmail: user.email || 'test@example.com',
            accountName: "Test Account",
            role: "user",
            invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/invitation?token=test-token`,
            expiresIn: "7 days"
          }),
        });
        break;
        
      case 'simple':
        // Send simple test email
        result = await sendEmail({
          to,
          subject: 'Test Email from Wondrous Digital',
          html: `
            <h1>Test Email</h1>
            <p>This is a test email from Wondrous Digital.</p>
            <p>If you received this, the email service is working correctly!</p>
            <p>Sent at: ${new Date().toISOString()}</p>
          `,
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use "invitation" or "simple"' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'Test email sent successfully (check console in development)' 
        : 'Failed to send test email',
      error: result.error,
      data: result.data,
    });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}