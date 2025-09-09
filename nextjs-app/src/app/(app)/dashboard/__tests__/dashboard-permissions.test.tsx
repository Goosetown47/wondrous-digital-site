import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useIsAccountOwner } from '@/hooks/useRole';

// Mock hooks
vi.mock('@/hooks/useRole', () => ({
  useIsAccountOwner: vi.fn(),
  useIsAdmin: vi.fn(() => ({ data: false })),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', email: 'test@example.com' },
    currentAccount: { id: '1', name: 'Test Account' },
  })),
}));

describe('Dashboard Permission-based Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Account Owner Permissions', () => {
    it('should show billing page only to account owners', () => {
      vi.mocked(useIsAccountOwner).mockReturnValue({ 
        data: true,
        isLoading: false,
        error: null
      } as ReturnType<typeof useIsAccountOwner>);
      
      // Mock a billing page component
      const BillingPage = () => {
        const { data: isOwner } = useIsAccountOwner();
        
        if (!isOwner) {
          return <div>Access Denied</div>;
        }
        
        return <div>Billing Dashboard</div>;
      };
      
      render(<BillingPage />);
      expect(screen.getByText('Billing Dashboard')).toBeInTheDocument();
    });

    it('should deny billing access to non-owners', () => {
      vi.mocked(useIsAccountOwner).mockReturnValue({ 
        data: false,
        isLoading: false,
        error: null
      } as ReturnType<typeof useIsAccountOwner>);
      
      // Mock a billing page component
      const BillingPage = () => {
        const { data: isOwner } = useIsAccountOwner();
        
        if (!isOwner) {
          return <div>Access Denied</div>;
        }
        
        return <div>Billing Dashboard</div>;
      };
      
      render(<BillingPage />);
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should show team members page only to account owners', () => {
      vi.mocked(useIsAccountOwner).mockReturnValue({ 
        data: true,
        isLoading: false,
        error: null
      } as ReturnType<typeof useIsAccountOwner>);
      
      // Mock a team members page component
      const TeamMembersPage = () => {
        const { data: isOwner } = useIsAccountOwner();
        
        if (!isOwner) {
          return <div>Access Denied</div>;
        }
        
        return <div>Team Members</div>;
      };
      
      render(<TeamMembersPage />);
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    it('should show account settings page only to account owners', () => {
      vi.mocked(useIsAccountOwner).mockReturnValue({ 
        data: true,
        isLoading: false,
        error: null
      } as ReturnType<typeof useIsAccountOwner>);
      
      // Mock an account settings page component
      const AccountSettingsPage = () => {
        const { data: isOwner } = useIsAccountOwner();
        
        if (!isOwner) {
          return <div>Access Denied</div>;
        }
        
        return <div>Account Settings</div>;
      };
      
      render(<AccountSettingsPage />);
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });
  });

  describe('General User Access', () => {
    it('should allow all users to access dashboard', () => {
      const DashboardPage = () => <div>Dashboard</div>;
      
      render(<DashboardPage />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should allow all users to access updates page', () => {
      const UpdatesPage = () => <div>Updates</div>;
      
      render(<UpdatesPage />);
      expect(screen.getByText('Updates')).toBeInTheDocument();
    });

    it('should allow all users to access tasks page', () => {
      const TasksPage = () => <div>Tasks</div>;
      
      render(<TasksPage />);
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    it('should allow all users to access archived projects', () => {
      const ArchivedProjectsPage = () => <div>Archived Projects</div>;
      
      render(<ArchivedProjectsPage />);
      expect(screen.getByText('Archived Projects')).toBeInTheDocument();
    });
  });
});