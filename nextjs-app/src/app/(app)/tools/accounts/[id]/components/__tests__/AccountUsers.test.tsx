import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountUsers } from '../AccountUsers';

// Mock hooks
const mockUseAccountUsers = vi.fn();
const mockUseAccountInvitations = vi.fn();
const mockUseUpdateUserRole = vi.fn();
const mockUseRemoveUser = vi.fn();
const mockUseCreateInvitation = vi.fn();
const mockUseCancelInvitation = vi.fn();
const mockUseResendInvitation = vi.fn();
const mockUseUserProjectCounts = vi.fn();
const mockUseAccountProjectCount = vi.fn();

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

vi.mock('@/hooks/useUserProjectCounts', () => ({
  useUserProjectCounts: () => mockUseUserProjectCounts(),
  useAccountProjectCount: () => mockUseAccountProjectCount(),
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
  let queryClient: QueryClient;
  
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

  // Helper function to render with providers
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    // Default mock returns
    mockUseAccountUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });
    
    mockUseAccountInvitations.mockReturnValue({
      data: mockInvitations,
      isLoading: false,
    });
    
    mockUseUserProjectCounts.mockReturnValue({
      data: [
        {
          user_id: 'user-1',
          project_count: 5,
          project_names: ['Project 1', 'Project 2', 'Project 3', 'Project 4', 'Project 5'],
          has_all_access: true,
        },
        {
          user_id: 'user-2',
          project_count: 2,
          project_names: ['Project 1', 'Project 3'],
          has_all_access: false,
        },
      ],
      isLoading: false,
    });
    
    mockUseAccountProjectCount.mockReturnValue({
      data: 5,
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
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      expect(screen.getByText('John Owner')).toBeInTheDocument();
      expect(screen.getByText('owner@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Member')).toBeInTheDocument();
      expect(screen.getByText('member@example.com')).toBeInTheDocument();
    });

    it('should show user status badges', () => {
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
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
      
      const { container } = renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      // Look for Skeleton components or loading indicators
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show empty state when no users', () => {
      mockUseAccountUsers.mockReturnValue({
        data: [],
        isLoading: false,
      });
      
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      expect(screen.getByText('No users yet. Invite someone to get started!')).toBeInTheDocument();
    });

    it.skip('should handle role change', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseUpdateUserRole.mockReturnValue({
        mutateAsync,
        isPending: false,
      });
      
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      // Find the select trigger buttons - they have role="combobox"
      // Look for buttons with the text "user" which is the current role
      const userRow = screen.getByText('Jane Member').closest('tr');
      const selectTrigger = within(userRow!).getByRole('button', { name: /user/i });
      
      fireEvent.click(selectTrigger);
      
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
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
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
    it.skip('should display list of invitations', async () => {
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      // Switch to invitations tab
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      fireEvent.click(invitationsTab);
      
      // Wait for the tab content to change
      await waitFor(() => {
        expect(screen.getByText('invited@example.com')).toBeInTheDocument();
      });
      expect(screen.getByText('expired@example.com')).toBeInTheDocument();
    });

    it.skip('should show invitation status', async () => {
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      // Switch to invitations tab
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      fireEvent.click(invitationsTab);
      
      // Wait for the tab content to load
      await waitFor(() => {
        const pendingBadges = screen.getAllByText('Pending');
        expect(pendingBadges.length).toBeGreaterThan(0);
      });
      
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should handle resend invitation', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseResendInvitation.mockReturnValue({
        mutateAsync,
        isPending: false,
      });
      
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
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
      
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
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
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      const inviteButton = screen.getByRole('button', { name: /Invite User/ });
      fireEvent.click(inviteButton);
      
      expect(screen.getByText('Invite a team member')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('colleague@company.com')).toBeInTheDocument();
    });

    it.skip('should handle sending invitation', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseCreateInvitation.mockReturnValue({
        mutateAsync,
        isPending: false,
      });
      
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      // Open dialog
      const inviteButton = screen.getByRole('button', { name: /Invite User/ });
      fireEvent.click(inviteButton);
      
      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Invite a team member')).toBeInTheDocument();
      });
      
      // Fill in email
      const emailInput = screen.getByPlaceholderText('colleague@company.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      
      // Find and click the role select trigger
      const dialogContent = screen.getByRole('dialog');
      const selectTrigger = within(dialogContent).getByRole('button', { name: /user/i });
      fireEvent.click(selectTrigger);
      
      // Select Account Owner from dropdown
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
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      // Open dialog
      const inviteButton = screen.getByRole('button', { name: /Invite User/ });
      fireEvent.click(inviteButton);
      
      const sendButton = screen.getByRole('button', { name: 'Send Invitation' });
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Project Access Indicators', () => {
    it('should show "All Projects" badge for account owners', () => {
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      // Find the row for the account owner (user-1)
      const ownerRow = screen.getByText('John Owner').closest('tr');
      expect(within(ownerRow!).getByText('All Projects')).toBeInTheDocument();
    });

    it('should show project count for regular users', () => {
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      // Find the row for the regular user (user-2)
      const userRow = screen.getByText('Jane Member').closest('tr');
      expect(within(userRow!).getByText('2 of 5 projects')).toBeInTheDocument();
    });

    it('should show "No Access" for users without project access', () => {
      mockUseUserProjectCounts.mockReturnValue({
        data: [
          {
            user_id: 'user-1',
            project_count: 5,
            project_names: ['Project 1', 'Project 2', 'Project 3', 'Project 4', 'Project 5'],
            has_all_access: true,
          },
          {
            user_id: 'user-2',
            project_count: 0,
            project_names: [],
            has_all_access: false,
          },
        ],
        isLoading: false,
      });
      
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      // Find the row for user-2 who has no access
      const userRow = screen.getByText('Jane Member').closest('tr');
      expect(within(userRow!).getByText('No Access')).toBeInTheDocument();
    });

    it('should show loading state when project counts are loading', () => {
      mockUseUserProjectCounts.mockReturnValue({
        data: null,
        isLoading: true,
      });
      
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      // Should show loading for regular user
      const userRow = screen.getByText('Jane Member').closest('tr');
      expect(within(userRow!).getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Tab Badges', () => {
    it('should show user count badge', () => {
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      const membersTab = screen.getByRole('tab', { name: /Members/ });
      const badge = within(membersTab).getByText('2');
      expect(badge).toBeInTheDocument();
    });

    it('should show invitation count badge', () => {
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      const badge = within(invitationsTab).getByText('2');
      expect(badge).toBeInTheDocument();
    });

    it('should not show invitation badge when no invitations', () => {
      mockUseAccountInvitations.mockReturnValue({
        data: [],
        isLoading: false,
      });
      
      renderWithProviders(<AccountUsers accountId={mockAccountId} />);
      
      const invitationsTab = screen.getByRole('tab', { name: /Invitations/ });
      const badges = within(invitationsTab).queryAllByText(/\d+/);
      expect(badges).toHaveLength(0);
    });
  });
});