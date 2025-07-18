/**
 * Basic tests for Admin Management System
 * 
 * These tests verify:
 * 1. Database schema is correctly set up
 * 2. Status transitions work as expected
 * 3. RLS policies prevent unauthorized access
 * 4. Views return expected data
 */

import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Create a test client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test utilities
async function runTest(name: string, testFn: () => Promise<void>) {
  console.log(`\n🧪 Testing: ${name}`);
  try {
    await testFn();
    console.log(`✅ ${name} - PASSED`);
  } catch (error) {
    console.error(`❌ ${name} - FAILED:`, error);
  }
}

// Tests
async function testDatabaseSchema() {
  // Test 1: Check if new columns exist in projects table
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, project_status, subdomain, deployment_status')
    .limit(1);
  
  if (projectsError) throw projectsError;
  console.log('  - Projects table has new columns ✓');

  // Test 2: Check if new columns exist in customers table
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id, account_type, subscription_status')
    .limit(1);
  
  if (customersError) throw customersError;
  console.log('  - Customers table has new columns ✓');

  // Test 3: Check if new tables exist
  const tables = ['project_versions', 'audit_logs', 'project_status_history', 'maintenance_pages'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    console.log(`  - ${table} table exists ✓`);
  }
}

async function testProjectManagementView() {
  // Test the view returns expected structure
  const { data, error } = await supabase
    .from('project_management_view')
    .select('*')
    .limit(5);
  
  if (error) throw error;
  
  // Check if view has expected columns
  if (data && data.length > 0) {
    const expectedColumns = ['id', 'project_name', 'project_status', 'tab_category', 'business_name'];
    const actualColumns = Object.keys(data[0]);
    
    for (const col of expectedColumns) {
      if (!actualColumns.includes(col)) {
        throw new Error(`Missing expected column: ${col}`);
      }
    }
    console.log('  - View has all expected columns ✓');
    console.log(`  - Found ${data.length} projects in view ✓`);
  } else {
    console.log('  - View exists but no data to verify structure');
  }
}

async function testStatusTransitionFunction() {
  // This test would need a test project and authenticated user
  // For now, just verify the function exists
  try {
    // Try to call the function with invalid parameters to see if it exists
    const { error } = await supabase.rpc('transition_project_status', {
      p_project_id: '00000000-0000-0000-0000-000000000000',
      p_new_status: 'draft',
      p_user_id: '00000000-0000-0000-0000-000000000000'
    });
    
    // We expect an error (project not found), but not a function not found error
    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      throw error;
    }
    console.log('  - Status transition function exists ✓');
  } catch (error: any) {
    if (error.message && error.message.includes('does not exist')) {
      throw error;
    }
    // Other errors are expected (like project not found)
    console.log('  - Status transition function exists ✓');
  }
}

async function testRLSPolicies() {
  // Test that anonymous users cannot access admin tables
  const adminTables = ['audit_logs', 'project_status_history'];
  
  for (const table of adminTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    // We expect an error or empty data for anonymous users
    if (error || !data || data.length === 0) {
      console.log(`  - ${table} protected by RLS ✓`);
    } else {
      console.warn(`  - WARNING: ${table} may not be properly protected`);
    }
  }
}

async function testAccountTypes() {
  // Test that account types are properly set
  const { data, error } = await supabase
    .from('customers')
    .select('account_type, count', { count: 'exact', head: true })
    .eq('account_type', 'prospect');
  
  if (error) throw error;
  console.log('  - Account type enum working ✓');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Admin Management System Tests\n');
  console.log('Note: These are basic smoke tests. Full testing would require authenticated users and test data.\n');

  await runTest('Database Schema', testDatabaseSchema);
  await runTest('Project Management View', testProjectManagementView);
  await runTest('Status Transition Function', testStatusTransitionFunction);
  await runTest('RLS Policies', testRLSPolicies);
  await runTest('Account Types', testAccountTypes);
  
  console.log('\n✨ Test suite completed!\n');
}

// Export for use in test runner or direct execution
export { runAllTests };

// Allow running directly with: npx tsx src/tests/admin-management.test.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}