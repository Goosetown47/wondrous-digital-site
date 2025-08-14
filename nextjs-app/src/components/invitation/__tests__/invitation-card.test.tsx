import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvitationCard } from '../invitation-card';
import type { InvitationWithAccount } from '@/lib/services/invitations';

// Mock the InvitationActions component
vi.mock('../invitation-actions', () => ({
  InvitationActions: vi.fn(() => <div data-testid="invitation-actions">Actions</div>),
}));

describe('InvitationCard', () => {
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
    inviter: {
      email: 'inviter@example.com',
      user_metadata: {
        display_name: 'John Doe',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display account name', () => {
    render(<InvitationCard invitation={mockInvitation} token="test-token" />);
    
    expect(screen.getByText('Test Account')).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
  });

  it('should display inviter name', () => {
    render(<InvitationCard invitation={mockInvitation} token="test-token" />);
    
    expect(screen.getByText(/John Doe has invited you to join/)).toBeInTheDocument();
  });

  it('should fall back to inviter email when display name not available', () => {
    const invitationWithoutName = {
      ...mockInvitation,
      inviter: {
        email: 'inviter@example.com',
      },
    };

    render(<InvitationCard invitation={invitationWithoutName} token="test-token" />);
    
    expect(screen.getByText(/inviter has invited you to join/)).toBeInTheDocument();
  });

  it('should display role badge for user', () => {
    render(<InvitationCard invitation={mockInvitation} token="test-token" />);
    
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText(/access to view and work on projects/)).toBeInTheDocument();
  });

  it('should display role badge for account owner', () => {
    const ownerInvitation = {
      ...mockInvitation,
      role: 'account_owner' as const,
    };

    render(<InvitationCard invitation={ownerInvitation} token="test-token" />);
    
    expect(screen.getByText('Account Owner')).toBeInTheDocument();
    expect(screen.getByText(/full administrative access/)).toBeInTheDocument();
  });

  it('should display inviter email', () => {
    render(<InvitationCard invitation={mockInvitation} token="test-token" />);
    
    expect(screen.getByText(/inviter@example.com/)).toBeInTheDocument();
  });

  it('should display expiration date', () => {
    const expirationDate = new Date(Date.now() + 86400000);
    const invitationWithExpiry = {
      ...mockInvitation,
      expires_at: expirationDate.toISOString(),
    };

    render(<InvitationCard invitation={invitationWithExpiry} token="test-token" />);
    
    const formattedDate = expirationDate.toLocaleDateString();
    expect(screen.getByText(new RegExp(`Expires ${formattedDate}`))).toBeInTheDocument();
  });

  it('should render InvitationActions component', () => {
    render(<InvitationCard invitation={mockInvitation} token="test-token" />);
    
    expect(screen.getByTestId('invitation-actions')).toBeInTheDocument();
  });

  it('should display "You\'re Invited!" title', () => {
    render(<InvitationCard invitation={mockInvitation} token="test-token" />);
    
    expect(screen.getByText("You're Invited!")).toBeInTheDocument();
  });
});