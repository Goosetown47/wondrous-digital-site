import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  checkCooldownStatus,
  isCooldownActive,
  getCooldownEndTime,
  updateLastChangeTime,
  toggleCooldownOverride,
  getCooldownErrorMessage
} from '../billing-cooldown';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type { MockSupabaseClient } from '@/test/mocks/types';
import { createMockSupabaseClient, createMockQueryBuilder } from '@/test/mocks/types';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock('@/lib/supabase/service', () => ({
  createSupabaseServiceClient: vi.fn()
}));

describe('Billing Cooldown Service', () => {
  let mockSupabase: MockSupabaseClient;
  let mockSupabaseService: MockSupabaseClient;

  // Helper to set up mock responses
  const setupMockResponse = (client: MockSupabaseClient, response: { data: unknown; error: unknown }) => {
    const mockQueryBuilder = createMockQueryBuilder();
    mockQueryBuilder.single.mockResolvedValue(response);
    client.from.mockReturnValue(mockQueryBuilder);
    return mockQueryBuilder;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock Supabase clients
    mockSupabase = createMockSupabaseClient();
    mockSupabaseService = createMockSupabaseClient();
    
    // Mock the client creators
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    vi.mocked(createSupabaseServiceClient).mockReturnValue(mockSupabaseService as unknown as ReturnType<typeof createSupabaseServiceClient>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkCooldownStatus', () => {
    it('should return inactive when no previous change exists', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: { 
          last_plan_change_at: null,
          cooldown_override: false 
        },
        error: null
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const status = await checkCooldownStatus('account-123');
      
      expect(status).toEqual({
        isActive: false,
        endsAt: null,
        timeRemaining: null,
        canMakeChange: true
      });
    });

    it('should return active with time remaining when within 24 hours', async () => {
      const now = new Date('2025-09-02T14:00:00Z');
      const lastChange = new Date('2025-09-02T10:00:00Z'); // 4 hours ago
      vi.setSystemTime(now);

      setupMockResponse(mockSupabase, {
        data: { 
          last_plan_change_at: lastChange.toISOString(),
          cooldown_override: false 
        },
        error: null
      });

      const status = await checkCooldownStatus('account-123');
      
      expect(status.isActive).toBe(true);
      expect(status.canMakeChange).toBe(false);
      expect(status.timeRemaining).toBe('20 hours');
    });

    it('should return inactive when 24 hours have passed', async () => {
      const now = new Date('2025-09-03T11:00:00Z');
      const lastChange = new Date('2025-09-02T10:00:00Z'); // 25 hours ago
      vi.setSystemTime(now);

      setupMockResponse(mockSupabase, {
        data: { 
          last_plan_change_at: lastChange.toISOString(),
          cooldown_override: false 
        },
        error: null
      });

      const status = await checkCooldownStatus('account-123');
      
      expect(status.isActive).toBe(false);
      expect(status.canMakeChange).toBe(true);
    });

    it('should bypass cooldown when override flag is true', async () => {
      const now = new Date('2025-09-02T14:00:00Z');
      const lastChange = new Date('2025-09-02T13:00:00Z'); // 1 hour ago
      vi.setSystemTime(now);

      setupMockResponse(mockSupabase, {
        data: { 
          last_plan_change_at: lastChange.toISOString(),
          cooldown_override: true // Override enabled
        },
        error: null
      });

      const status = await checkCooldownStatus('account-123');
      
      expect(status.isActive).toBe(false);
      expect(status.canMakeChange).toBe(true);
    });

    it('should show hours and minutes when less than 24 hours remain', async () => {
      const now = new Date('2025-09-02T14:30:00Z');
      const lastChange = new Date('2025-09-02T10:00:00Z'); // 4.5 hours ago
      vi.setSystemTime(now);

      setupMockResponse(mockSupabase, {
        data: { 
          last_plan_change_at: lastChange.toISOString(),
          cooldown_override: false 
        },
        error: null
      });

      const status = await checkCooldownStatus('account-123');
      
      expect(status.timeRemaining).toBe('19 hours and 30 minutes');
    });

    it('should show only minutes when less than 1 hour remains', async () => {
      const now = new Date('2025-09-03T09:15:00Z');
      const lastChange = new Date('2025-09-02T10:00:00Z'); // 23 hours 15 minutes ago
      vi.setSystemTime(now);

      setupMockResponse(mockSupabase, {
        data: { 
          last_plan_change_at: lastChange.toISOString(),
          cooldown_override: false 
        },
        error: null
      });

      const status = await checkCooldownStatus('account-123');
      
      expect(status.timeRemaining).toBe('45 minutes');
    });
  });

  describe('isCooldownActive', () => {
    it('should return true when cooldown is active', async () => {
      const now = new Date('2025-09-02T14:00:00Z');
      const lastChange = new Date('2025-09-02T10:00:00Z');
      vi.setSystemTime(now);

      setupMockResponse(mockSupabase, {
        data: { 
          last_plan_change_at: lastChange.toISOString(),
          cooldown_override: false 
        },
        error: null
      });

      const isActive = await isCooldownActive('account-123');
      expect(isActive).toBe(true);
    });

    it('should return false when cooldown is not active', async () => {
      setupMockResponse(mockSupabase, {
        data: { 
          last_plan_change_at: null,
          cooldown_override: false 
        },
        error: null
      });

      const isActive = await isCooldownActive('account-123');
      expect(isActive).toBe(false);
    });
  });

  describe('getCooldownEndTime', () => {
    it('should return end time when cooldown is active', async () => {
      const now = new Date('2025-09-02T14:00:00Z');
      const lastChange = new Date('2025-09-02T10:00:00Z');
      vi.setSystemTime(now);

      setupMockResponse(mockSupabase, {
        data: { 
          last_plan_change_at: lastChange.toISOString(),
          cooldown_override: false 
        },
        error: null
      });

      const endTime = await getCooldownEndTime('account-123');
      expect(endTime).toEqual(new Date('2025-09-03T10:00:00Z'));
    });

    it('should return null when no cooldown exists', async () => {
      setupMockResponse(mockSupabase, {
        data: { 
          last_plan_change_at: null,
          cooldown_override: false 
        },
        error: null
      });

      const endTime = await getCooldownEndTime('account-123');
      expect(endTime).toBeNull();
    });
  });

  describe('updateLastChangeTime', () => {
    it('should update the last plan change timestamp', async () => {
      const now = new Date('2025-09-02T15:00:00Z');
      vi.setSystemTime(now);

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({
        error: null
      });
      mockSupabaseService.from.mockReturnValue(mockQueryBuilder);

      await updateLastChangeTime('account-123');

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        last_plan_change_at: now.toISOString()
      });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'account-123');
    });

    it('should throw error if update fails', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({
        error: new Error('Database error')
      });
      mockSupabaseService.from.mockReturnValue(mockQueryBuilder);

      await expect(updateLastChangeTime('account-123')).rejects.toThrow(
        'Failed to update cooldown timestamp'
      );
    });
  });

  describe('toggleCooldownOverride', () => {
    it('should enable cooldown override', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({
        error: null
      });
      mockSupabaseService.from.mockReturnValue(mockQueryBuilder);

      await toggleCooldownOverride('account-123', true);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        cooldown_override: true
      });
    });

    it('should disable cooldown override', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({
        error: null
      });
      mockSupabaseService.from.mockReturnValue(mockQueryBuilder);

      await toggleCooldownOverride('account-123', false);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        cooldown_override: false
      });
    });
  });

  describe('getCooldownErrorMessage', () => {
    it('should return user-friendly error message with time remaining', () => {
      const message = getCooldownErrorMessage('17 hours and 23 minutes');
      
      expect(message).toContain('You recently made a plan change');
      expect(message).toContain('17 hours and 23 minutes');
      expect(message).toContain('You can still cancel any pending changes');
    });

    it('should handle singular time units correctly', () => {
      const message = getCooldownErrorMessage('1 hour and 1 minute');
      
      expect(message).toContain('1 hour and 1 minute');
    });
  });
});