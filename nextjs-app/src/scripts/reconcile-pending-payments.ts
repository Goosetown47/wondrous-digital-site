#!/usr/bin/env tsx
/**
 * Reconciliation script for pending Stripe payments
 * 
 * This script processes any unprocessed pending_stripe_payments records
 * and applies them to existing accounts. This handles cases where:
 * - The webhook fired before the account was created
 * - The email confirmation didn't properly apply the payment
 * - Manual reconciliation is needed after a system issue
 * 
 * Usage: npm run reconcile-payments
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create service role client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function reconcilePendingPayments() {
  console.log('🔄 Starting pending payment reconciliation...\n');

  try {
    // Get all unprocessed pending payments
    const { data: pendingPayments, error: fetchError } = await supabase
      .from('pending_stripe_payments')
      .select('*')
      .is('processed_at', null)
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch pending payments: ${fetchError.message}`);
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('✅ No pending payments to process');
      return;
    }

    console.log(`Found ${pendingPayments.length} pending payment(s) to process\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const payment of pendingPayments) {
      console.log(`Processing payment for ${payment.email}...`);
      console.log(`  - Tier: ${payment.tier}`);
      console.log(`  - Amount: ${payment.currency} ${(payment.amount_paid / 100).toFixed(2)}`);
      console.log(`  - Created: ${new Date(payment.created_at).toLocaleString()}`);

      // Find user by email
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', payment.email.toLowerCase())
        .single();

      if (!userData) {
        console.log(`  ⏭️  Skipped: User not found (will be processed on signup)\n`);
        skipCount++;
        continue;
      }

      // Find user's account
      const { data: accountUser } = await supabase
        .from('account_users')
        .select('account_id')
        .eq('user_id', userData.id)
        .eq('role', 'account_owner')
        .single();

      if (!accountUser) {
        console.log(`  ⏭️  Skipped: No account found (will be processed on account creation)\n`);
        skipCount++;
        continue;
      }

      // Get current account state
      const { data: account } = await supabase
        .from('accounts')
        .select('id, tier, stripe_customer_id')
        .eq('id', accountUser.account_id)
        .single();

      if (!account) {
        console.log(`  ❌ Error: Account ${accountUser.account_id} not found\n`);
        errorCount++;
        continue;
      }

      // Check if already has a paid tier
      if (account.tier !== 'FREE' && account.stripe_customer_id) {
        console.log(`  ⏭️  Skipped: Account already has ${account.tier} tier\n`);
        
        // Mark as processed anyway to clean up
        await supabase
          .from('pending_stripe_payments')
          .update({ 
            processed_at: new Date().toISOString(),
            metadata: { 
              ...payment.metadata,
              skipped_reason: 'account_already_upgraded' 
            }
          })
          .eq('id', payment.id);
        
        skipCount++;
        continue;
      }

      // Apply the payment to the account
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          tier: payment.tier,
          stripe_customer_id: payment.stripe_customer_id,
          stripe_subscription_id: payment.stripe_subscription_id,
          subscription_status: 'active',
          setup_fee_paid: true,
          setup_fee_paid_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      if (updateError) {
        console.log(`  ❌ Error updating account: ${updateError.message}\n`);
        errorCount++;
        continue;
      }

      // Mark payment as processed
      await supabase
        .from('pending_stripe_payments')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', payment.id);

      // Log to billing history
      await supabase
        .from('account_billing_history')
        .insert({
          account_id: account.id,
          event_type: 'payment_reconciled',
          old_tier: account.tier,
          new_tier: payment.tier,
          amount_cents: payment.amount_paid,
          currency: payment.currency,
          stripe_event_id: payment.stripe_session_id,
          metadata: {
            pending_payment_id: payment.id,
            stripe_customer_id: payment.stripe_customer_id,
            stripe_subscription_id: payment.stripe_subscription_id,
            original_created_at: payment.created_at,
            reconciled_at: new Date().toISOString(),
            reconciliation_reason: 'manual_reconciliation',
          },
        });

      console.log(`  ✅ Successfully upgraded account to ${payment.tier}\n`);
      successCount++;
    }

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('📊 Reconciliation Complete');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Processed: ${successCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total: ${pendingPayments.length}`);

  } catch (error) {
    console.error('❌ Reconciliation failed:', error);
    process.exit(1);
  }
}

// Run the reconciliation
reconcilePendingPayments()
  .then(() => {
    console.log('\n✨ Reconciliation complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });