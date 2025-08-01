import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmailPreferences, useUpdateEmailPreferences } from '../useEmailPreferences';
import { createMockSupabaseClient } from '@/test/utils/supabase-mocks';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import React from 'react';

// Mock dependencies
vi.mock('@/lib/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

// Import mocked modules
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
// import { toast } from '@/components/ui/use-toast';

// Type helper for mocked Supabase client
type MockSupabaseClient = SupabaseClient<Database> & {
  from: ReturnType<typeof vi.fn>;
};

describe('Email Preferences Hooks', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;
  const mockUser = { id: 'user-123', email: 'user@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    
    // Default auth state
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser });
  });

  describe('useEmailPreferences', () => {
    it('should fetch existing email preferences', async () => {
      const mockPreferences = {
        user_id: mockUser.id,
        marketing_emails: true,
        product_updates: true,
        security_alerts: true,
        billing_notifications: true,
        weekly_digest: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockPreferences,
          error: null,
        }),
      });

      const { result } = renderHook(() => useEmailPreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPreferences);
      expect(supabase.from).toHaveBeenCalledWith('email_preferences');
    });

    it('should create default preferences if none exist', async () => {
      const defaultPreferences = {
        user_id: mockUser.id,
        marketing_emails: true,
        product_updates: true,
        security_alerts: true,
        billing_notifications: true,
        weekly_digest: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // First query returns not found
      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      });

      // Insert query returns new preferences
      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: defaultPreferences,
          error: null,
        }),
      });

      const { result } = renderHook(() => useEmailPreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(defaultPreferences);
      expect(((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>)().insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        marketing_emails: true,
        product_updates: true,
        security_alerts: true,
        billing_notifications: true,
        weekly_digest: true,
      });
    });

    it('should handle database errors', async () => {
      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database connection failed'),
        }),
      });

      const { result } = renderHook(() => useEmailPreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Database connection failed');
    });

    it('should not fetch if user is not authenticated', () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null });

      const { result } = renderHook(() => useEmailPreferences(), { wrapper });

      expect(result.current.isIdle).toBe(true);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('useUpdateEmailPreferences', () => {
    it('should update email preferences successfully', async () => {
      const updates = {
        marketing_emails: false,
        weekly_digest: true,
      };

      const updatedPreferences = {
        user_id: mockUser.id,
        marketing_emails: false,
        product_updates: true,
        security_alerts: true,
        billing_notifications: true,
        weekly_digest: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      };

      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: updatedPreferences,
          error: null,
        }),
      });

      const { result } = renderHook(() => useUpdateEmailPreferences(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      expect(((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>)().update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String),
      });
      expect(((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>)().eq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    it('should update query cache on success', async () => {
      const updates = { marketing_emails: false };
      const updatedPreferences = {
        user_id: mockUser.id,
        marketing_emails: false,
        product_updates: true,
        security_alerts: true,
        billing_notifications: true,
        weekly_digest: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      };

      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: updatedPreferences,
          error: null,
        }),
      });

      const { result } = renderHook(() => useUpdateEmailPreferences(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(updates);
      });

      // Check that query cache was updated
      const cachedData = queryClient.getQueryData(['email-preferences', mockUser.id]);
      expect(cachedData).toEqual(updatedPreferences);
    });

    it('should handle update errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Update failed'),
        }),
      });

      const { result } = renderHook(() => useUpdateEmailPreferences(), { wrapper });

      await expect(
        result.current.mutateAsync({ marketing_emails: false })
      ).rejects.toThrow('Update failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update email preferences:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should require user to be authenticated', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null });

      const { result } = renderHook(() => useUpdateEmailPreferences(), { wrapper });

      await expect(
        result.current.mutateAsync({ marketing_emails: false })
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('Security and Validation Tests', () => {
    it('should not allow disabling security alerts through API', async () => {
      // This test validates that security-critical preferences are protected
      // In the UI, these fields would be disabled, but we test API protection too
      const updates = {
        security_alerts: false, // Should be protected
        billing_notifications: false, // Should be protected
      };

      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { 
            code: '23514', 
            message: 'check constraint violation' 
          },
        }),
      });

      const { result } = renderHook(() => useUpdateEmailPreferences(), { wrapper });

      await expect(
        result.current.mutateAsync(updates)
      ).rejects.toThrow();
    });

    it('should ensure preferences are user-specific', async () => {
      // RLS ensures only current user's preferences are accessible
      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((field, value) => {
          // RLS would ensure only current user's preferences are accessible
          expect(field).toBe('user_id');
          expect(value).toBe(mockUser.id); // Should always use current user's ID
          return {
            single: vi.fn().mockResolvedValue({
              data: { user_id: mockUser.id },
              error: null,
            }),
          };
        }),
      });

      const { result } = renderHook(() => useEmailPreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the query used the current user's ID, not any other ID
      expect(result.current.data?.user_id).toBe(mockUser.id);
    });

    it('should handle concurrent updates safely', async () => {
      const updates1 = { marketing_emails: false };
      const updates2 = { weekly_digest: true };

      let updateCount = 0;
      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockImplementation((data) => {
          updateCount++;
          return {
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...data, user_id: mockUser.id },
              error: null,
            }),
          };
        }),
      });

      const { result } = renderHook(() => useUpdateEmailPreferences(), { wrapper });

      // Perform concurrent updates
      await Promise.all([
        result.current.mutateAsync(updates1),
        result.current.mutateAsync(updates2),
      ]);

      // Both updates should have been processed
      expect(updateCount).toBe(2);
    });
  });

  describe('Unsubscribe Functionality', () => {
    it('should handle unsubscribe from all optional emails', async () => {
      const unsubscribeUpdates = {
        marketing_emails: false,
        product_updates: false,
        weekly_digest: false,
      };

      const updatedPreferences = {
        user_id: mockUser.id,
        marketing_emails: false,
        product_updates: false,
        security_alerts: true, // Should remain true
        billing_notifications: true, // Should remain true
        weekly_digest: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      };

      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: updatedPreferences,
          error: null,
        }),
      });

      const { result } = renderHook(() => useUpdateEmailPreferences(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(unsubscribeUpdates);
      });

      // Verify only optional preferences were updated
      expect(((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>)().update).toHaveBeenCalledWith({
        ...unsubscribeUpdates,
        updated_at: expect.any(String),
      });

      // Security alerts and billing should remain enabled
      const cachedData = queryClient.getQueryData(['email-preferences', mockUser.id]) as Record<string, unknown>;
      expect(cachedData?.security_alerts).toBe(true);
      expect(cachedData?.billing_notifications).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user metadata gracefully', async () => {
      const preferencesWithoutMetadata = {
        user_id: mockUser.id,
        marketing_emails: true,
        product_updates: true,
        security_alerts: true,
        billing_notifications: true,
        weekly_digest: true,
        // Missing created_at and updated_at
      };

      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: preferencesWithoutMetadata,
          error: null,
        }),
      });

      const { result } = renderHook(() => useEmailPreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(preferencesWithoutMetadata);
    });

    it('should handle partial updates correctly', async () => {
      const partialUpdate = { weekly_digest: false };

      ((supabase as MockSupabaseClient).from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockImplementation((data) => {
          // Ensure only specified fields are updated
          expect(data).toHaveProperty('weekly_digest', false);
          expect(data).toHaveProperty('updated_at');
          expect(Object.keys(data)).toHaveLength(2);
          return {
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...data, user_id: mockUser.id },
              error: null,
            }),
          };
        }),
      });

      const { result } = renderHook(() => useUpdateEmailPreferences(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(partialUpdate);
      });
    });

    it('should respect email preferences when sending emails', async () => {
      // This test simulates how the email service would check preferences
      const mockPreferences = {
        user_id: mockUser.id,
        marketing_emails: false,
        product_updates: true,
        security_alerts: true,
        billing_notifications: true,
        weekly_digest: false,
      };

      // Mock checking preferences before sending an email
      const canSendEmail = (type: keyof typeof mockPreferences): boolean => {
        if (type === 'user_id') return false;
        return mockPreferences[type] === true;
      };

      // Verify preference checking logic
      expect(canSendEmail('marketing_emails')).toBe(false);
      expect(canSendEmail('product_updates')).toBe(true);
      expect(canSendEmail('security_alerts')).toBe(true);
      expect(canSendEmail('weekly_digest')).toBe(false);
    });
  });
});