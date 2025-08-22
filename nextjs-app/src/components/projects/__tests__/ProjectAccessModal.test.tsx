import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ProjectAccessModal } from '../ProjectAccessModal';

// Mock hooks
const mockUseAccountUsers = vi.fn();
const mockUseProjectAccess = vi.fn();
const mockUseGrantProjectAccess = vi.fn();
const mockUseRevokeProjectAccess = vi.fn();
const mockUseUpdateProjectAccess = vi.fn();

vi.mock('@/hooks/useAccountUsers', () => ({
  useAccountUsers: () => mockUseAccountUsers(),
}));

vi.mock('@/hooks/useProjectAccess', () => ({
  useProjectAccess: () => mockUseProjectAccess(),
  useGrantProjectAccess: () => mockUseGrantProjectAccess(),
  useRevokeProjectAccess: () => mockUseRevokeProjectAccess(),
  useUpdateProjectAccess: () => mockUseUpdateProjectAccess(),
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

describe('ProjectAccessModal', () => {
  const mockProjectId = 'project-123';
  const mockProjectName = 'Test Project';
  const mockAccountId = 'account-123';
  const mockOnOpenChange = vi.fn();

  const mockAccountUsers = [
    {
      user_id: 'owner-1',
      account_id: mockAccountId,
      role: 'account_owner',
      joined_at: new Date().toISOString(),
      user: {
        id: 'owner-1',
        email: 'owner@example.com',
      },
      profile: {
        display_name: 'Account Owner',
      },
    },
    {
      user_id: 'user-1',
      account_id: mockAccountId,
      role: 'user',
      joined_at: new Date().toISOString(),
      user: {
        id: 'user-1',
        email: 'user1@example.com',
      },
      profile: {
        display_name: 'User One',
      },
    },
    {
      user_id: 'user-2',
      account_id: mockAccountId,
      role: 'user',
      joined_at: new Date().toISOString(),
      user: {
        id: 'user-2',
        email: 'user2@example.com',
      },
      profile: {
        display_name: 'User Two',
      },
    },
  ];

  const mockProjectAccess = [
    {
      id: 'access-1',
      project_id: mockProjectId,
      user_id: 'user-1',
      account_id: mockAccountId,
      granted_by: 'owner-1',
      granted_at: new Date().toISOString(),
      access_level: 'viewer',
      user_display_name: 'User One',
    },
  ];

  const mockGrantMutate = vi.fn();
  const mockRevokeMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAccountUsers.mockReturnValue({
      data: mockAccountUsers,
      isLoading: false,
    });

    mockUseProjectAccess.mockReturnValue({
      data: mockProjectAccess,
      isLoading: false,
    });

    mockUseGrantProjectAccess.mockReturnValue({
      mutateAsync: mockGrantMutate,
      isPending: false,
    });

    mockUseRevokeProjectAccess.mockReturnValue({
      mutateAsync: mockRevokeMutate,
      isPending: false,
    });

    mockUseUpdateProjectAccess.mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    });
  });

  describe('rendering', () => {
    it('should render the modal when open', () => {
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText('Manage Project Access')).toBeInTheDocument();
      expect(screen.getByText(mockProjectName, { exact: false })).toBeInTheDocument();
    });

    it('should display users with current access', () => {
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('2 days ago')).toBeInTheDocument();
    });

    it('should display users without access', () => {
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // User Two should be in the "Grant Access" section
      const grantSection = screen.getByText('Grant Access to Users').parentElement;
      expect(within(grantSection!).getByText('User Two')).toBeInTheDocument();
    });

    it('should not show account owners in users without access', () => {
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Account Owner should not appear in the grant access section
      const grantSection = screen.getByText('Grant Access to Users').parentElement;
      expect(within(grantSection!).queryByText('Account Owner')).not.toBeInTheDocument();
    });
  });

  describe('granting access', () => {
    it('should grant access to a single user', async () => {
      mockGrantMutate.mockResolvedValueOnce({});
      
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Find the grant button for User Two
      const userTwoRow = screen.getByText('User Two').closest('tr');
      const grantButton = within(userTwoRow!).getByText('Grant');
      
      fireEvent.click(grantButton);

      await waitFor(() => {
        expect(mockGrantMutate).toHaveBeenCalledWith({
          projectId: mockProjectId,
          userId: 'user-2',
          accountId: mockAccountId,
          accessLevel: 'viewer',
        });
      });

      const { toast } = await import('sonner');
      expect(toast.success).toHaveBeenCalledWith('Access granted successfully');
    });

    it('should handle grant access errors', async () => {
      mockGrantMutate.mockRejectedValueOnce(new Error('Failed to grant'));
      
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const grantButtons = screen.getAllByText('Grant');
      fireEvent.click(grantButtons[0]);

      await waitFor(async () => {
        const { toast } = await import('sonner');
        expect(toast.error).toHaveBeenCalledWith('Failed to grant access');
      });
    });
  });

  describe('bulk operations', () => {
    it('should select multiple users for bulk grant', async () => {
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Select User Two
      const checkboxes = screen.getAllByRole('checkbox');
      const userTwoCheckbox = checkboxes.find(cb => 
        cb.closest('tr')?.textContent?.includes('User Two')
      );
      
      fireEvent.click(userTwoCheckbox!);

      // Should show bulk action bar
      expect(screen.getByText('1 user selected')).toBeInTheDocument();
      expect(screen.getByText('Grant Access')).toBeInTheDocument();
    });

    it('should grant access to multiple users', async () => {
      mockGrantMutate.mockResolvedValue({});
      
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Select User Two
      const checkboxes = screen.getAllByRole('checkbox');
      const userTwoCheckbox = checkboxes.find(cb => 
        cb.closest('tr')?.textContent?.includes('User Two')
      );
      
      fireEvent.click(userTwoCheckbox!);

      // Click bulk grant button
      const grantButton = screen.getByRole('button', { name: /Grant Access/i });
      fireEvent.click(grantButton);

      await waitFor(() => {
        expect(mockGrantMutate).toHaveBeenCalledWith({
          projectId: mockProjectId,
          userId: 'user-2',
          accountId: mockAccountId,
          accessLevel: 'viewer',
        });
      });

      const { toast } = await import('sonner');
      expect(toast.success).toHaveBeenCalledWith('Granted access to 1 users');
    });
  });

  describe('revoking access', () => {
    it('should revoke access from a user', async () => {
      mockRevokeMutate.mockResolvedValueOnce({});
      
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Find the revoke button (X icon) for User One
      const userOneRow = screen.getByText('User One').closest('tr');
      const revokeButton = within(userOneRow!).getByRole('button');
      
      fireEvent.click(revokeButton);

      await waitFor(() => {
        expect(mockRevokeMutate).toHaveBeenCalledWith({
          projectId: mockProjectId,
          userId: 'user-1',
          accountId: mockAccountId,
        });
      });

      const { toast } = await import('sonner');
      expect(toast.success).toHaveBeenCalledWith('Access revoked successfully');
    });
  });

  describe('updating access levels', () => {
    it('should update access level for a user', async () => {
      mockUpdateMutate.mockResolvedValueOnce({});
      
      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Find the select for User One
      const userOneRow = screen.getByText('User One').closest('tr');
      const select = within(userOneRow!).getByRole('combobox');
      
      fireEvent.click(select);
      
      // Select "Editor" option
      const editorOption = screen.getByText('Editor');
      fireEvent.click(editorOption);

      await waitFor(() => {
        expect(mockUpdateMutate).toHaveBeenCalledWith({
          projectId: mockProjectId,
          userId: 'user-1',
          accessLevel: 'editor',
        });
      });

      const { toast } = await import('sonner');
      expect(toast.success).toHaveBeenCalledWith('Access level updated');
    });
  });

  describe('empty states', () => {
    it('should show empty state when no users have access', () => {
      mockUseProjectAccess.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText('No users have been granted specific access to this project yet.')).toBeInTheDocument();
    });

    it('should show empty state when all users have access', () => {
      mockUseAccountUsers.mockReturnValue({
        data: [mockAccountUsers[0]], // Only account owner
        isLoading: false,
      });

      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText('All team members already have access or are account owners.')).toBeInTheDocument();
    });
  });

  describe('loading states', () => {
    it('should show loading skeletons when data is loading', () => {
      mockUseProjectAccess.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(
        <ProjectAccessModal
          projectId={mockProjectId}
          projectName={mockProjectName}
          accountId={mockAccountId}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Should show skeleton loaders
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});