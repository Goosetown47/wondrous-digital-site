import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { InvitationWithAccount } from '@/lib/services/invitations';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth provider
const mockUseAuth = vi.fn();
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { InvitationActions } from '../invitation-actions';

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch;

describe('InvitationActions', () => {
  const mockInvitation: InvitationWithAccount = {
    id: '123',
    account_id: 'acc-123',
    email: 'test@example.com',
    role: 'user',
    token: 'test-token',
    invited_by: 'inviter-id',
    invited_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    accounts: {
      name: 'Test Account',
      slug: 'test-account',
    },
  };

  const mockSetIsProcessing = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    
    // Clear sessionStorage
    sessionStorage.clear();
  });

  describe('when user is not logged in', () => {
    it('should show "Login to Accept" button', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      expect(screen.getByText('Login to Accept')).toBeInTheDocument();
    });

    it('should redirect to login when accept is clicked', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      const acceptButton = screen.getByText('Login to Accept');
      fireEvent.click(acceptButton);

      expect(sessionStorage.getItem('pendingInvitation')).toBe('test-token');
      expect(mockPush).toHaveBeenCalledWith(
        '/login?invitation=test-token&returnTo=/invitation?token=test-token'
      );
    });

    it('should show sign up link', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('should redirect to signup when sign up is clicked', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      const signupLink = screen.getByText('Sign up');
      fireEvent.click(signupLink);

      expect(sessionStorage.getItem('pendingInvitation')).toBe('test-token');
      expect(mockPush).toHaveBeenCalledWith('/signup?invitation=test-token');
    });
  });

  describe('when user is logged in', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123', email: 'user@example.com' },
        loading: false,
      });
    });

    it('should show "Accept Invitation" button', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
    });

    it('should call API to accept invitation', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      const acceptButton = screen.getByText('Accept Invitation');
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/invitations/by-token/test-token/accept',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle accept error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Already a member' }),
      });

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      const acceptButton = screen.getByText('Accept Invitation');
      fireEvent.click(acceptButton);

      await waitFor(() => {
        const { toast } = await import('sonner');
        expect(toast.error).toHaveBeenCalledWith('Already a member');
      });
    });

    it('should auto-accept pending invitation after login', async () => {
      sessionStorage.setItem('pendingInvitation', 'test-token');
      
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/invitations/by-token/test-token/accept',
          expect.any(Object)
        );
      });

      expect(sessionStorage.getItem('pendingInvitation')).toBeNull();
    });
  });

  describe('decline functionality', () => {
    it('should call API to decline invitation', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      const declineButton = screen.getByText('Decline Invitation');
      fireEvent.click(declineButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/invitations/by-token/test-token/decline',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });

      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should handle decline error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Cannot decline invitation' }),
      });

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={false}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      const declineButton = screen.getByText('Decline Invitation');
      fireEvent.click(declineButton);

      await waitFor(() => {
        const { toast } = await import('sonner');
        expect(toast.error).toHaveBeenCalledWith('Cannot decline invitation');
      });
    });
  });

  describe('loading states', () => {
    it('should show loading state when processing', () => {
      // When processing is true, the buttons should be disabled
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isProcessing={true}
          setIsProcessing={mockSetIsProcessing}
        />
      );

      // Both buttons should be disabled when processing
      const acceptButton = screen.getByRole('button', { name: /Accept|Login/i });
      const declineButton = screen.getByRole('button', { name: /Decline/i });
      
      expect(acceptButton).toBeDisabled();
      expect(declineButton).toBeDisabled();
    });

  });
});