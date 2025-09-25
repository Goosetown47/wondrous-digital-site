import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { toggleCooldownOverride } from '@/lib/services/billing-cooldown';

/**
 * Admin-only endpoint to toggle cooldown override for testing purposes
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const { accountId, enabled } = body as { accountId: string; enabled: boolean };

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to manage cooldown overrides' },
        { status: 401 }
      );
    }

    // Check if user is a platform admin
    const { data: adminUser } = await supabase
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .single();
    
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only platform administrators can manage cooldown overrides' },
        { status: 403 }
      );
    }

    // Toggle the cooldown override
    await toggleCooldownOverride(accountId, enabled);

    // Log the action for audit purposes
    console.log(`[Admin] Cooldown override ${enabled ? 'enabled' : 'disabled'} for account ${accountId} by user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: `Cooldown override ${enabled ? 'enabled' : 'disabled'} for testing. ${
        enabled 
          ? 'This account can now make plan changes without cooldown restrictions.' 
          : 'Normal 24-hour cooldown period is now enforced.'
      }`,
      cooldownOverride: enabled
    });
  } catch (error) {
    console.error('Cooldown override error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to toggle cooldown override',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}