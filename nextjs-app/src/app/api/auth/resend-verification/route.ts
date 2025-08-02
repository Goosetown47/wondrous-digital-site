import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of rateLimitMap.entries()) {
    if (data.resetAt < now) {
      rateLimitMap.delete(email);
    }
  }
}, 60000); // Clean up every minute

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit (3 requests per hour per email)
    const now = Date.now();
    const rateLimit = rateLimitMap.get(normalizedEmail);
    
    if (rateLimit) {
      if (rateLimit.resetAt > now) {
        if (rateLimit.count >= 3) {
          const minutesLeft = Math.ceil((rateLimit.resetAt - now) / 60000);
          return NextResponse.json(
            { error: `Too many requests. Please try again in ${minutesLeft} minutes.` },
            { status: 429 }
          );
        }
        rateLimit.count++;
      } else {
        // Reset the rate limit
        rateLimitMap.set(normalizedEmail, { count: 1, resetAt: now + 3600000 }); // 1 hour
      }
    } else {
      rateLimitMap.set(normalizedEmail, { count: 1, resetAt: now + 3600000 });
    }

    // Use admin client to resend verification email
    const supabase = createAdminClient();
    
    // First, check if user exists and is not already verified
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }

    const user = users.users.find(u => u.email === normalizedEmail);
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ success: true });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate a new email verification link
    const { error: resendError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
    });

    if (resendError) {
      console.error('Error resending verification:', resendError);
      return NextResponse.json(
        { error: 'Failed to resend verification email' },
        { status: 500 }
      );
    }

    // Log the resend attempt
    await supabase.from('audit_logs').insert({
      account_id: '00000000-0000-0000-0000-000000000000', // Platform account
      user_id: user.id,
      action: 'resend_verification_email',
      resource_type: 'auth',
      resource_id: user.id,
      metadata: {
        email: normalizedEmail,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in resend verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}