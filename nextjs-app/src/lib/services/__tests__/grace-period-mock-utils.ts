import type { MockSupabaseClient } from '@/test/mocks/types';
import { createMockSupabaseClient, createMockQueryBuilder } from '@/test/mocks/types';

/**
 * Utility to create a properly chained Supabase mock
 * @deprecated Use createMockSupabaseClient from @/test/mocks/types instead
 */
export function createSupabaseMock(): MockSupabaseClient {
  return createMockSupabaseClient();
}

/**
 * Mock account data for testing
 */
export const mockAccount = {
  id: 'test-account-id',
  name: 'Test Account',
  tier: 'PRO' as const,
  stripe_customer_id: 'cus_test123',
  stripe_subscription_id: 'sub_test123',
  grace_period_ends_at: null,
  subscription_state: 'active',
  pending_tier_change: null,
  pending_tier_change_date: null,
  settings: {},
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

/**
 * Mock notification data for testing
 */
export const mockNotification = {
  id: 'notif-1',
  account_id: 'test-account-id',
  notification_type: 'grace_period_day_0' as const,
  scheduled_for: '2025-01-15T10:00:00Z',
  sent: false,
  sent_at: null,
  metadata: {
    tier: 'PRO',
    grace_period_ends_at: '2025-01-29T10:00:00Z'
  },
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

/**
 * Helper to create a query builder mock for specific table responses
 */
export function createTableMock(tableName: string, data: unknown) {
  const queryBuilder = createMockQueryBuilder({ data, error: null });
  return queryBuilder;
}

/**
 * Helper to create a mock with error response
 */
export function createErrorMock(error: { message: string; code?: string }) {
  const queryBuilder = createMockQueryBuilder({ data: null, error });
  return queryBuilder;
}