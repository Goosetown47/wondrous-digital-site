import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeFormData } from '@/lib/security/sanitize';

export async function POST(request: Request) {
  try {
    const rawData = await request.json();
    
    // Sanitize input data
    const { accountName, website, description } = sanitizeFormData(rawData, {
      accountName: 'plain',
      website: 'url',
      description: 'plain',
    });
    
    if (!accountName) {
      return NextResponse.json(
        { error: 'Account name is required' },
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
    
    // Check if user already has an account
    const { data: existingAccount } = await adminClient
      .from('account_users')
      .select('account_id')
      .eq('user_id', user.id)
      .single();
    
    if (existingAccount) {
      return NextResponse.json(
        { error: 'User already has an account' },
        { status: 400 }
      );
    }
    
    // Generate a slug from the account name (same logic from auth/confirm)
    const baseSlug = accountName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    
    // Ensure slug is unique
    let slug = baseSlug;
    let slugSuffix = 0;
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await adminClient
        .from('accounts')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existing) break;
      
      slugSuffix++;
      slug = `${baseSlug}-${slugSuffix}`;
      attempts++;
    }
    
    // Create the account using admin client (bypasses RLS)
    const { data: newAccount, error: accountError } = await adminClient
      .from('accounts')
      .insert({
        name: accountName,
        slug: slug,
        tier: 'FREE', // Will be updated in payment step if user purchases
        settings: {
          website: website || null,
          description: description || null,
        },
      })
      .select()
      .single();
    
    if (accountError) {
      console.error('Account creation error:', accountError);
      return NextResponse.json(
        { error: accountError.message || 'Failed to create account' },
        { status: 500 }
      );
    }
    
    // Link user to account as account_owner
    const { error: linkError } = await adminClient
      .from('account_users')
      .insert({
        account_id: newAccount.id,
        user_id: user.id,
        role: 'account_owner',
      });
    
    if (linkError) {
      // If linking fails, try to clean up the account
      await adminClient
        .from('accounts')
        .delete()
        .eq('id', newAccount.id);
      
      console.error('Account user link error:', linkError);
      return NextResponse.json(
        { error: linkError.message || 'Failed to link account to user' },
        { status: 500 }
      );
    }
    
    console.log(`[Signup] Account created successfully: ${newAccount.id} for user ${user.email}`);
    
    return NextResponse.json({
      account: newAccount,
      message: 'Account created successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error creating account:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}