import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use admin client to check if user has any accounts
    const adminClient = createAdminClient();
    const { data: accounts, error: accountsError } = await adminClient
      .from('account_users')
      .select('account_id')
      .eq('user_id', user.id)
      .limit(1);

    if (accountsError) {
      console.error('Error checking user accounts:', accountsError);
      // Default to dashboard on error
      return NextResponse.json({ redirect: '/dashboard' });
    }

    // Determine redirect based on whether user has accounts
    const hasAccounts = accounts && accounts.length > 0;
    const redirect = hasAccounts ? '/dashboard' : '/setup';

    // Log the decision for debugging
    console.log(`[Post-Login] User ${user.email} - Has accounts: ${hasAccounts} - Redirecting to: ${redirect}`);

    return NextResponse.json({ 
      redirect,
      hasAccounts,
      userId: user.id,
      email: user.email
    });

  } catch (error) {
    console.error('Unexpected error in post-login:', error);
    // Default to dashboard on error
    return NextResponse.json({ redirect: '/dashboard' });
  }
}