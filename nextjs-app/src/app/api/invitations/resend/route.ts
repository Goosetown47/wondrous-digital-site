import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/services/email';
import { InvitationEmail } from '@/emails/invitation';
import { getAppUrl } from '@/lib/utils/app-url';
import React from 'react';

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email && !token) {
      return NextResponse.json(
        { error: 'Email or invitation token is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find the invitation - either by email from session storage or by token
    let query = supabase
      .from('account_invitations')
      .select(`
        *,
        accounts!inner(name)
      `)
      .is('accepted_at', null)
      .is('declined_at', null)
      .is('cancelled_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('invited_at', { ascending: false })
      .limit(1);

    if (token) {
      query = query.eq('token', token);
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
    }

    const { data: invitation, error } = await query.single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'No pending invitation found for this email' },
        { status: 404 }
      );
    }

    // Get inviter details
    const { data: inviterData } = await supabase.auth.admin.getUserById(invitation.invited_by);
    const inviterUser = inviterData?.user;
    
    const accountName = invitation.accounts?.name || 'the team';
    const inviterName = inviterUser?.user_metadata?.display_name || 
                       inviterUser?.email?.split('@')[0] || 
                       'A team member';
    const inviterEmail = inviterUser?.email || 'noreply@wondrousdigital.com';

    // Calculate days remaining
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const expiresIn = daysRemaining > 1 ? `${daysRemaining} days` : '24 hours';

    // Resend the invitation email
    const appUrl = getAppUrl();
    const invitationLink = `${appUrl}/invitation?token=${invitation.token}`;

    await sendEmail({
      to: invitation.email,
      from: 'Wondrous Digital <invitations@wondrousdigital.com>',
      subject: `Reminder: ${inviterName} invited you to join ${accountName}`,
      react: React.createElement(InvitationEmail, {
        inviteeName: invitation.email.split('@')[0],
        inviterName: inviterName,
        inviterEmail: inviterEmail,
        accountName: accountName,
        role: invitation.role,
        invitationLink: invitationLink,
        expiresIn: expiresIn,
      }),
    });

    return NextResponse.json({ 
      success: true,
      message: 'Invitation email has been resent',
      token: invitation.token 
    });
    
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation email' },
      { status: 500 }
    );
  }
}