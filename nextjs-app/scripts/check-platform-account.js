import { createAdminClient } from '../src/lib/supabase/admin.js';

async function checkPlatformAccount() {
  const adminClient = createAdminClient();
  
  // Check if platform account exists
  const { data: platformAccount, error: accountError } = await adminClient
    .from('accounts')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single();
    
  if (accountError) {
    console.log('Platform account not found:', accountError.message);
    
    // Create it
    console.log('Creating platform account...');
    const { data: newAccount, error: createError } = await adminClient
      .from('accounts')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Wondrous Digital Platform',
        slug: 'platform',
      })
      .select()
      .single();
      
    if (createError) {
      console.error('Failed to create platform account:', createError);
      return;
    }
    
    console.log('Platform account created:', newAccount);
  } else {
    console.log('Platform account exists:', platformAccount);
  }
  
  // Check admin users
  const { data: admins, error: adminError } = await adminClient
    .from('account_users')
    .select('*')
    .eq('account_id', '00000000-0000-0000-0000-000000000000')
    .eq('role', 'admin');
    
  if (adminError) {
    console.error('Error fetching admins:', adminError);
  } else {
    console.log(`Found ${admins?.length || 0} platform admins`);
    if (admins?.length) {
      console.log('Admins:', admins.map(a => a.user_id));
    }
  }
  
  // Migrate existing admins if needed
  if (!admins?.length) {
    console.log('No platform admins found. Checking for legacy admins...');
    
    const { data: legacyAdmins } = await adminClient
      .from('account_users')
      .select('user_id, account_id')
      .eq('role', 'admin')
      .neq('account_id', '00000000-0000-0000-0000-000000000000');
      
    if (legacyAdmins?.length) {
      console.log(`Found ${legacyAdmins.length} legacy admins to migrate`);
      
      for (const admin of legacyAdmins) {
        const { error } = await adminClient
          .from('account_users')
          .upsert({
            user_id: admin.user_id,
            account_id: '00000000-0000-0000-0000-000000000000',
            role: 'admin',
            joined_at: new Date().toISOString(),
          });
          
        if (error) {
          console.error(`Failed to migrate admin ${admin.user_id}:`, error);
        } else {
          console.log(`Migrated admin ${admin.user_id} to platform account`);
        }
      }
    }
  }
}

checkPlatformAccount().catch(console.error);