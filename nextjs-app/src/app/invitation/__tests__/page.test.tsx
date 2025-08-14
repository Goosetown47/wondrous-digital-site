import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import InvitationPage from '../page';

// Mock next/navigation
const mockPush = vi.fn();
const mockUseSearchParams = vi.fn();
const mockUseRouter = vi.fn(() => ({
  push: mockPush,
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => mockUseRouter(),
}));

// Mock the InvitationCard component
vi.mock('@/components/invitation/invitation-card', () => ({
  InvitationCard: vi.fn(({ invitation, token }) => (
    <div data-testid="invitation-card">
      <p>Account: {invitation.accounts?.name}</p>
      <p>Token: {token}</p>
    </div>
  )),
}));

// Mock fetch
global.fetch = vi.fn();

describe('InvitationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when no token is provided', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => null),
    });

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByText('Unable to process invitation')).toBeInTheDocument();
      expect(screen.getByText('No invitation token provided')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching invitation', () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'test-token'),
    });

    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves to keep loading
    );

    const { container } = render(<InvitationPage />);

    // Look for loading card structure since Skeleton components may not have specific class names
    const card = container.querySelector('.max-w-md');
    expect(card).toBeInTheDocument();
    
    // Check if we have the Card structure with loading state
    const cardContent = container.querySelector('[class*="card"]');
    expect(cardContent).toBeInTheDocument();
  });

  it('should display invitation card with valid token', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'valid-token'),
    });

    const mockInvitation = {
      id: '123',
      token: 'valid-token',
      email: 'test@example.com',
      role: 'user',
      accounts: {
        name: 'Test Account',
        slug: 'test-account',
      },
      inviter: {
        email: 'inviter@example.com',
      },
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvitation,
    });

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('invitation-card')).toBeInTheDocument();
      expect(screen.getByText('Account: Test Account')).toBeInTheDocument();
      expect(screen.getByText('Token: valid-token')).toBeInTheDocument();
    });
  });

  it('should show error for expired invitation', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'expired-token'),
    });

    const mockInvitation = {
      expired: true,
      expires_at: new Date(Date.now() - 86400000).toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvitation,
    });

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByText('Unable to process invitation')).toBeInTheDocument();
      expect(screen.getByText('This invitation has expired')).toBeInTheDocument();
    });
  });

  it('should show error for already accepted invitation', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'accepted-token'),
    });

    const mockInvitation = {
      accepted_at: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvitation,
    });

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByText('Unable to process invitation')).toBeInTheDocument();
      expect(screen.getByText('This invitation has already been accepted')).toBeInTheDocument();
    });
  });

  it('should show error when API returns error', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => 'invalid-token'),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invitation not found' }),
    });

    render(<InvitationPage />);

    await waitFor(() => {
      expect(screen.getByText('Unable to process invitation')).toBeInTheDocument();
      expect(screen.getByText('Invitation not found')).toBeInTheDocument();
    });
  });

  it('should have link to login page on error', async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => null),
    });

    render(<InvitationPage />);

    await waitFor(() => {
      const loginLink = screen.getByText('Go to login page');
      expect(loginLink).toBeInTheDocument();
      loginLink.click();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});