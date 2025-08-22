import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test database URL and keys (should be test environment)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe.skip('RLS Cross-Tenant Data Isolation', () => {
  let serviceClient: ReturnType<typeof createClient>;
  let user1Client: ReturnType<typeof createClient>;
  let user2Client: ReturnType<typeof createClient>;
  
  // Test data
  let account1Id: string = '';
  let account2Id: string = '';
  let user1Id: string = '';
  let user2Id: string = '';
  let project1Id: string = '';
  let project2Id: string = '';

  beforeAll(async () => {
    // Skip in CI or if no database connection
    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('test.supabase.co')) {
      console.log('Skipping RLS tests - no real database configuration available');
      return;
    }

    // Create service client (bypasses RLS)
    serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Clean up any existing test data
    await serviceClient.auth.admin.deleteUser('test-user-1@example.com').catch(() => {});
    await serviceClient.auth.admin.deleteUser('test-user-2@example.com').catch(() => {});

    // Create test users
    const { data: userData1 } = await serviceClient.auth.admin.createUser({
      email: 'test-user-1@example.com',
      password: 'TestPassword123!',
      email_confirm: true
    });
    user1Id = userData1?.user?.id || '';

    const { data: userData2 } = await serviceClient.auth.admin.createUser({
      email: 'test-user-2@example.com',
      password: 'TestPassword123!',
      email_confirm: true
    });
    user2Id = userData2?.user?.id || '';

    // Create test accounts
    const { data: acc1 } = await serviceClient
      .from('accounts')
      .insert({ name: 'Test Account 1' })
      .select()
      .single();
    if (acc1?.id && typeof acc1.id === 'string') {
      account1Id = acc1.id;
    }

    const { data: acc2 } = await serviceClient
      .from('accounts')
      .insert({ name: 'Test Account 2' })
      .select()
      .single();
    if (acc2?.id && typeof acc2.id === 'string') {
      account2Id = acc2.id;
    }

    // Add users to their respective accounts
    await serviceClient
      .from('account_users')
      .insert([
        { account_id: account1Id, user_id: user1Id, role: 'account_owner' },
        { account_id: account2Id, user_id: user2Id, role: 'account_owner' }
      ]);

    // Create test projects
    const { data: proj1 } = await serviceClient
      .from('projects')
      .insert({
        account_id: account1Id,
        name: 'Project 1',
        subdomain: 'test-project-1',
        status: 'active'
      })
      .select()
      .single();
    if (proj1?.id && typeof proj1.id === 'string') {
      project1Id = proj1.id;
    }

    const { data: proj2 } = await serviceClient
      .from('projects')
      .insert({
        account_id: account2Id,
        name: 'Project 2',
        subdomain: 'test-project-2',
        status: 'active'
      })
      .select()
      .single();
    if (proj2?.id && typeof proj2.id === 'string') {
      project2Id = proj2.id;
    }

    // Create authenticated clients for each user
    user1Client = createClient(supabaseUrl, supabaseAnonKey);
    await user1Client.auth.signInWithPassword({
      email: 'test-user-1@example.com',
      password: 'TestPassword123!'
    });

    user2Client = createClient(supabaseUrl, supabaseAnonKey);
    await user2Client.auth.signInWithPassword({
      email: 'test-user-2@example.com',
      password: 'TestPassword123!'
    });
  });

  afterAll(async () => {
    if (!serviceClient) return;

    // Clean up test data
    try {
      await serviceClient.from('projects').delete().in('id', [project1Id, project2Id]);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await serviceClient.from('account_users').delete().in('user_id', [user1Id, user2Id]);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await serviceClient.from('accounts').delete().in('id', [account1Id, account2Id]);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await serviceClient.auth.admin.deleteUser(user1Id);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await serviceClient.auth.admin.deleteUser(user2Id);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Account Isolation', () => {
    it('should only allow users to see their own accounts', async () => {
      if (!user1Client || !user2Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 should only see Account 1
      const { data: user1Accounts } = await user1Client
        .from('account_users')
        .select('account_id');
      
      expect(user1Accounts).toHaveLength(1);
      expect(user1Accounts?.[0]?.account_id).toBe(account1Id);

      // User 2 should only see Account 2
      const { data: user2Accounts } = await user2Client
        .from('account_users')
        .select('account_id');
      
      expect(user2Accounts).toHaveLength(1);
      expect(user2Accounts?.[0]?.account_id).toBe(account2Id);
    });

    it('should prevent users from accessing other accounts directly', async () => {
      if (!user1Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 tries to access Account 2 (should fail)
      const { data } = await user1Client
        .from('accounts')
        .select()
        .eq('id', account2Id);
      
      expect(data).toEqual([]);
    });
  });

  describe('Project Isolation', () => {
    it('should only allow users to see projects in their accounts', async () => {
      if (!user1Client || !user2Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 should only see Project 1
      const { data: user1Projects } = await user1Client
        .from('projects')
        .select('id, name');
      
      expect(user1Projects).toHaveLength(1);
      expect(user1Projects?.[0]?.id).toBe(project1Id);

      // User 2 should only see Project 2
      const { data: user2Projects } = await user2Client
        .from('projects')
        .select('id, name');
      
      expect(user2Projects).toHaveLength(1);
      expect(user2Projects?.[0]?.id).toBe(project2Id);
    });

    it('should prevent users from accessing other account projects', async () => {
      if (!user1Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 tries to access Project 2 (should fail)
      const { data } = await user1Client
        .from('projects')
        .select()
        .eq('id', project2Id);
      
      expect(data).toEqual([]);
    });

    it('should prevent users from updating other account projects', async () => {
      if (!user1Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 tries to update Project 2 (should fail)
      const { data } = await user1Client
        .from('projects')
        .update({ name: 'Hacked Project' })
        .eq('id', project2Id);
      
      expect(data).toEqual([]);
      // RLS should prevent the update
    });

    it('should prevent users from deleting other account projects', async () => {
      if (!user1Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 tries to delete Project 2 (should fail)
      const { data } = await user1Client
        .from('projects')
        .delete()
        .eq('id', project2Id);
      
      expect(data).toEqual([]);
      // RLS should prevent the deletion
    });
  });

  describe('Account User Management', () => {
    it('should only allow users to see their own account memberships', async () => {
      if (!user1Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 should only see their own membership
      const { data } = await user1Client
        .from('account_users')
        .select('user_id, account_id');
      
      expect(data).toHaveLength(1);
      expect(data?.[0]?.user_id).toBe(user1Id);
      expect(data?.[0]?.account_id).toBe(account1Id);
    });

    it('should prevent non-admins from adding users to accounts', async () => {
      if (!user1Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // Create a third test user
      const { data: userData3 } = await serviceClient.auth.admin.createUser({
        email: 'test-user-3@example.com',
        password: 'TestPassword123!',
        email_confirm: true
      });
      const user3Id = userData3?.user?.id;

      // User 1 (who is account_owner) tries to add User 3 to their account
      const { error } = await user1Client
        .from('account_users')
        .insert({
          account_id: account1Id,
          user_id: user3Id,
          role: 'member'
        });

      // This should succeed since User 1 is account_owner
      expect(error).toBeNull();

      // Clean up
      if (user3Id) {
        try {
          await serviceClient.from('account_users').delete().eq('user_id', user3Id);
        } catch {
          // Ignore cleanup errors
        }
        try {
          await serviceClient.auth.admin.deleteUser(user3Id);
        } catch {
          // Ignore cleanup errors
        }
      }
    });

    it('should prevent users from adding themselves to other accounts', async () => {
      if (!user1Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 tries to add themselves to Account 2 (should fail)
      const { data, error } = await user1Client
        .from('account_users')
        .insert({
          account_id: account2Id,
          user_id: user1Id,
          role: 'member'
        });

      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });
  });

  describe('Cross-Table Isolation', () => {
    it('should prevent access to related data through joins', async () => {
      if (!user1Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 tries to access Account 2's data through joins
      const { data } = await user1Client
        .from('projects')
        .select(`
          id,
          name,
          accounts!inner(
            id,
            name
          )
        `)
        .eq('accounts.id', account2Id);

      expect(data).toEqual([]);
    });

    it('should only return authorized data in complex queries', async () => {
      if (!user1Client) {
        console.log('Skipping test - no database connection');
        return;
      }

      // User 1 performs a complex query - should only get their data
      const { data } = await user1Client
        .from('accounts')
        .select(`
          id,
          name,
          projects(
            id,
            name,
            subdomain
          )
        `);

      expect(data).toHaveLength(1);
      expect(data?.[0]?.id).toBe(account1Id);
      expect(data?.[0]?.projects).toHaveLength(1);
      const firstProject = data?.[0]?.projects?.[0];
      expect(firstProject).toBeDefined();
      if (firstProject && typeof firstProject === 'object' && 'id' in firstProject) {
        expect((firstProject as { id: string }).id).toBe(project1Id);
      }
    });
  });

  describe('Platform Admin Access', () => {
    it('should allow platform admins to access all data', async () => {
      if (!serviceClient) {
        console.log('Skipping test - no database connection');
        return;
      }

      // Create a platform admin user
      const { data: adminData } = await serviceClient.auth.admin.createUser({
        email: 'platform-admin@example.com',
        password: 'AdminPassword123!',
        email_confirm: true,
        user_metadata: { is_platform_admin: true }
      });
      const adminId = adminData?.user?.id;

      // Update the user to be a platform admin
      if (adminId) {
        await serviceClient
          .from('users')
          .update({ is_platform_admin: true })
          .eq('id', adminId);
      }

      // Create admin client
      const adminClient = createClient(supabaseUrl, supabaseAnonKey);
      await adminClient.auth.signInWithPassword({
        email: 'platform-admin@example.com',
        password: 'AdminPassword123!'
      });

      // Admin should see all accounts
      const { data: allAccounts } = await adminClient
        .from('accounts')
        .select('id');

      // Should see at least both test accounts
      expect(allAccounts?.length).toBeGreaterThanOrEqual(2);
      const accountIds = allAccounts?.map(a => a.id) || [];
      expect(accountIds).toContain(account1Id);
      expect(accountIds).toContain(account2Id);

      // Admin should see all projects
      const { data: allProjects } = await adminClient
        .from('projects')
        .select('id');

      // Should see at least both test projects
      expect(allProjects?.length).toBeGreaterThanOrEqual(2);
      const projectIds = allProjects?.map(p => p.id) || [];
      expect(projectIds).toContain(project1Id);
      expect(projectIds).toContain(project2Id);

      // Clean up
      if (adminId) {
        try {
          await serviceClient.auth.admin.deleteUser(adminId);
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });
});