import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, settings = {} } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Account name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Use service role to bypass RLS for account creation
    const serviceClient = createAdminClient();

    // Ensure slug is unique
    let attempts = 0;
    let uniqueSlug = slug;
    while (attempts < 10) {
      const { data: existingAccount } = await serviceClient
        .from('accounts')
        .select('id')
        .eq('slug', uniqueSlug)
        .single();

      if (!existingAccount) break;

      attempts++;
      uniqueSlug = `${slug}-${Math.random().toString(36).substr(2, 4)}`;
    }

    if (attempts >= 10) {
      return NextResponse.json({ error: 'Could not generate unique account slug' }, { status: 500 });
    }

    // Check for pending payment before creating account
    const { data: pendingPayment } = await serviceClient
      .from('pending_stripe_payments')
      .select('*')
      .eq('email', user.email?.toLowerCase())
      .is('processed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Create the account with appropriate tier
    const { data: account, error: accountError } = await serviceClient
      .from('accounts')
      .insert({
        name: name.trim(),
        slug: uniqueSlug,
        tier: pendingPayment?.tier || 'FREE',
        stripe_customer_id: pendingPayment?.stripe_customer_id || null,
        stripe_subscription_id: pendingPayment?.stripe_subscription_id || null,
        subscription_status: pendingPayment ? 'active' : null,
        setup_fee_paid: pendingPayment ? true : false,
        setup_fee_paid_at: pendingPayment ? new Date().toISOString() : null,
        settings: {
          ...settings,
          created_via: 'onboarding',
          created_by: user.email,
        },
      })
      .select()
      .single();

    if (accountError) {
      console.error('Account creation error:', accountError);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Add user as account owner
    const { error: roleError } = await serviceClient
      .from('account_users')
      .insert({
        account_id: account.id,
        user_id: user.id,
        role: 'account_owner',
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      // Try to clean up the account
      await serviceClient
        .from('accounts')
        .delete()
        .eq('id', account.id);
      
      return NextResponse.json({ error: 'Failed to assign account ownership' }, { status: 500 });
    }

    // If we applied a pending payment, mark it as processed
    if (pendingPayment) {
      await serviceClient
        .from('pending_stripe_payments')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', pendingPayment.id);
      
      // Log to billing history
      await serviceClient
        .from('account_billing_history')
        .insert({
          account_id: account.id,
          event_type: 'payment_processed_from_pending',
          new_tier: pendingPayment.tier,
          amount_cents: pendingPayment.amount_paid,
          currency: pendingPayment.currency,
          stripe_event_id: pendingPayment.stripe_session_id,
          metadata: {
            pending_payment_id: pendingPayment.id,
            stripe_customer_id: pendingPayment.stripe_customer_id,
            stripe_subscription_id: pendingPayment.stripe_subscription_id,
            original_created_at: pendingPayment.created_at,
          },
        });
      
      console.log(`[Account Creation] Applied pending ${pendingPayment.tier} payment for ${user.email}`);
    }

    // Create audit log entry
    await serviceClient
      .from('audit_logs')
      .insert({
        table_name: 'accounts',
        record_id: account.id,
        action: 'INSERT',
        actor_id: user.id,
        actor_type: 'user',
        metadata: {
          account_name: account.name,
          account_slug: account.slug,
          source: 'onboarding',
        },
      });

    return NextResponse.json({
      id: account.id,
      name: account.name,
      slug: account.slug,
    });

  } catch (error) {
    console.error('Unexpected error in account creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}