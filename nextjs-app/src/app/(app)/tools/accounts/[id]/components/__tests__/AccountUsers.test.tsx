import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AccountUsers } from '../AccountUsers';

// Mock hooks
const mockUseAccountUsers = vi.fn();
const mockUseAccountInvitations = vi.fn();
const mockUseUpdateUserRole = vi.fn();
const mockUseRemoveUser = vi.fn();
const mockUseCreateInvitation = vi.fn();
const mockUseCancelInvitation = vi.fn();
const mockUseResendInvitation = vi.fn();

vi.mock('@/hooks/useAccountUsers', () => ({
  useAccountUsers: () => mockUseAccountUsers(),
  useUpdateUserRole: () => mockUseUpdateUserRole(),
  useRemoveUser: () => mockUseRemoveUser(),
}));

vi.mock('@/hooks/useInvitations', () => ({
  useAccountInvitations: () => mockUseAccountInvitations(),
  useCreateInvitation: () => mockUseCreateInvitation(),
  useCancelInvitation: () => mockUseCancelInvitation(),
  useResendInvitation: () => mockUseResendInvitation(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 days ago',
}));

describe('AccountUsers', () => {
  const mockAccountId = 'test-account-id';
  const mockUsers = [
    {
      user_id: 'user-1',
      account_id: mockAccountId,
      role: 'account_owner',
      joined_at: new Date().toISOString(),
      user: {
        id: 'user-1',
        email: 'owner@example.com',
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {
          full_name: 'John Owner',
        },
      },
    },
    {
      user_id: 'user-2',
      account_id: mockAccountId,
      role: 'user',
      joined_at: new Date().toISOString(),
      user: {
        id: 'user-2',
        email: 'member@example.com',
        email_confirmed_at: null,
        user_metadata: {
          full_name: 'Jane Member',
        },
      },
    },
  ];

  const mockInvitations = [
    {
      id: 'inv-1',
      account_id: mockAccountId,
      email: 'invited@example.com',
      role: 'user',
      invited_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: 'inv-2',
      account_id: mockAccountId,
      email: 'expired@example.com',
      role: 'account_owner',
      invited_at: new Date().toISOString(),
      expires_at: new Date(Date.now() - 86400000).toISOString(), // Expired
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock returns
    mockUseAccountUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });
    
    mockUseAccountInvitations.mockReturnValue({
      data: mockInvitations,
      isLoading: false,
    });
    
    mockUseUpdateUserRole.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    
    mockUseRemoveUser.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    
    mockUseCreateInvitation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    
    mockUseCancelInvitation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    
    mockUseResendInvitation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  describe('Members Tab', () => {
    it('should display list of users', () => {
      render(<AccountUsers accountId={mockAccountId} />);
      
      expect(screen.getByText('John Owner')).toBeInTheDocument();
      expect(screen.getByText('owner@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Member')).toBeInTheDocument();
      expect(screen.getByText('member@example.com')).toBeInTheDocument();
    });

    it('should show user status badges', () => {
      render(<AccountUsers accountId={mockAccountId} />);
      
      // Active user
      expect(screen.getByText('Active')).toBeInTheDocument();
      // Pending user (not confirmed)
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseAccountUsers.mockReturnValue({
        data: null,
        isLoading: true,
      });
      
      const { container } = render(<AccountUsers accountId={mockAccountId} />);
      const skeletons = container.querySelectorAll('[class*="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show empty state when no users', () => {
      mockUseAccountUsers.mockReturnValue({
        data: [],
        isLoading: false,
      });
      
      render(<AccountUsers accountId={mockAccountId} />);
      expect(screen.getByText('No users yet. Invite someone to get started!')).toBeInTheDocument();
    });

    it('should handle role change', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseUpdateUserRole.mockReturnValue({
        mutateAsync,
        isPending: false,
      });
      
      render(<AccountUsers accountId={mockAccountId} />);
      
      // Find the select for user-2 (the regular user)
      const selects = screen.getAllByRole('combobox');
      const userSelect = selects[1]; // Second user's select
      
      fireEvent.click(userSelect);
      
      // Wait for dropdown to open and select Account Owner
      await waitFor(() => {
        const option = screen.getByText('Account Owner');
        fireEvent.click(option);
      });
      
      expect(mutateAsync).toHaveBeenCalledWith({
        accountId: mockAccountId,
        userId: 'user-2',
        role: 'account_owner',
      });
    });

    it('should show remove user confirmation dialog', async () => {
      render(<AccountUsers accountId={mockAccountId} />);
      
      // Click the dropdown menu for first user
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      const menuButton = dropdownButtons.find(btn => btn.querySelector('[class*="lucide-more-horizontal"]'));
      
      if (menuButton) {
        fireEvent.click(menuButton);
        
        // Click remove option
        await waitFor(() => {
          const removeOption = screen.getByText('Remove from account');
          fireEvent.click(removeOption);
        });
        
        // Check confirmation dialog appears
        expect(screen.getByText('Remove team member?')).toBeInTheDocument();
        expect(screen.getByText(/owner@example.com/)).toBeInTheDocument();
      }
    });
  });

  describe('Invitations Tab', () => {
    it('should display list of invitations', () => {
      render(<AccountUsers accountId={mockAccountId} />);
      
      // Switch to invitations tab
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      fireEvent.click(invitationsTab);
      
      expect(screen.getByText('invited@example.com')).toBeInTheDocument();
      expect(screen.getByText('expired@example.com')).toBeInTheDocument();
    });

    it('should show invitation status', () => {
      render(<AccountUsers accountId={mockAccountId} />);
      
      // Switch to invitations tab
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      fireEvent.click(invitationsTab);
      
      // Check for status badges
      const pendingBadges = screen.getAllByText('Pending');
      expect(pendingBadges.length).toBeGreaterThan(0);
      
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should handle resend invitation', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseResendInvitation.mockReturnValue({
        mutateAsync,
        isPending: false,
      });
      
      render(<AccountUsers accountId={mockAccountId} />);
      
      // Switch to invitations tab
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      fireEvent.click(invitationsTab);
      
      // Find and click dropdown for first (non-expired) invitation
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      const menuButtons = dropdownButtons.filter(btn => btn.querySelector('[class*="lucide-more-horizontal"]'));
      
      // Click the first menu button in invitations section
      if (menuButtons.length > 0) {
        fireEvent.click(menuButtons[0]);
        
        await waitFor(() => {
          const resendOption = screen.getByText('Resend invitation');
          fireEvent.click(resendOption);
        });
        
        expect(mutateAsync).toHaveBeenCalledWith({
          invitationId: 'inv-1',
          accountId: mockAccountId,
        });
      }
    });

    it('should handle cancel invitation', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseCancelInvitation.mockReturnValue({
        mutateAsync,
        isPending: false,
      });
      
      render(<AccountUsers accountId={mockAccountId} />);
      
      // Switch to invitations tab
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      fireEvent.click(invitationsTab);
      
      // Find and click dropdown for any invitation
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      const menuButtons = dropdownButtons.filter(btn => btn.querySelector('[class*="lucide-more-horizontal"]'));
      
      if (menuButtons.length > 0) {
        fireEvent.click(menuButtons[0]);
        
        await waitFor(() => {
          const cancelOption = screen.getByText('Cancel invitation');
          fireEvent.click(cancelOption);
        });
        
        expect(mutateAsync).toHaveBeenCalledWith({
          invitationId: 'inv-1',
          accountId: mockAccountId,
        });
      }
    });
  });

  describe('Invite User Dialog', () => {
    it('should open invite user dialog', () => {
      render(<AccountUsers accountId={mockAccountId} />);
      
      const inviteButton = screen.getByRole('button', { name: /Invite User/ });
      fireEvent.click(inviteButton);
      
      expect(screen.getByText('Invite a team member')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('colleague@company.com')).toBeInTheDocument();
    });

    it('should handle sending invitation', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseCreateInvitation.mockReturnValue({
        mutateAsync,
        isPending: false,
      });
      
      render(<AccountUsers accountId={mockAccountId} />);
      
      // Open dialog
      const inviteButton = screen.getByRole('button', { name: /Invite User/ });
      fireEvent.click(inviteButton);
      
      // Fill in email
      const emailInput = screen.getByPlaceholderText('colleague@company.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      
      // Select role
      const roleSelect = screen.getByRole('combobox');
      fireEvent.click(roleSelect);
      
      await waitFor(() => {
        const accountOwnerOption = screen.getByText('Account Owner');
        fireEvent.click(accountOwnerOption);
      });
      
      // Send invitation
      const sendButton = screen.getByRole('button', { name: 'Send Invitation' });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          accountId: mockAccountId,
          email: 'new@example.com',
          role: 'account_owner',
        });
      });
    });

    it('should disable send button without email', () => {
      render(<AccountUsers accountId={mockAccountId} />);
      
      // Open dialog
      const inviteButton = screen.getByRole('button', { name: /Invite User/ });
      fireEvent.click(inviteButton);
      
      const sendButton = screen.getByRole('button', { name: 'Send Invitation' });
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Tab Badges', () => {
    it('should show user count badge', () => {
      render(<AccountUsers accountId={mockAccountId} />);
      
      const membersTab = screen.getByRole('tab', { name: /Members/ });
      const badge = within(membersTab).getByText('2');
      expect(badge).toBeInTheDocument();
    });

    it('should show invitation count badge', () => {
      render(<AccountUsers accountId={mockAccountId} />);
      
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      const badge = within(invitationsTab).getByText('2');
      expect(badge).toBeInTheDocument();
    });

    it('should not show invitation badge when no invitations', () => {
      mockUseAccountInvitations.mockReturnValue({
        data: [],
        isLoading: false,
      });
      
      render(<AccountUsers accountId={mockAccountId} />);
      
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      const badges = within(invitationsTab).queryAllByText(/\d+/);
      expect(badges).toHaveLength(0);
    });
  });
});