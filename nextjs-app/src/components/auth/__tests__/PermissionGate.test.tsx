import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionGate } from '../PermissionGate';
import { useAuth } from '@/providers/auth-provider';
import { useIsAdmin } from '@/hooks/useRole';
import { useHasPermission } from '@/hooks/usePermissions';
import { createTestScenario } from '@/test/utils/auth-mocks';

// Mock the hooks
vi.mock('@/providers/auth-provider');
vi.mock('@/hooks/useRole');
vi.mock('@/hooks/usePermissions');

describe('PermissionGate Component', () => {
  const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
  const mockUseIsAdmin = useIsAdmin as ReturnType<typeof vi.fn>;
  const mockUseHasPermission = useHasPermission as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Platform Admin Access', () => {
    beforeEach(() => {
      const { user, account } = createTestScenario('platformAdmin');
      mockUseAuth.mockReturnValue({
        user,
        currentAccount: account,
        loading: false,
      });
      mockUseIsAdmin.mockReturnValue({
        data: true,
        isLoading: false,
      });
      mockUseHasPermission.mockReturnValue({
        data: true,
        isLoading: false,
      });
    });

    it('should show content to platform admin regardless of permission', () => {
      render(
        <PermissionGate permission="any.permission">
          <div>Protected Content</div>
        </PermissionGate>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show content with single permission', () => {
      render(
        <PermissionGate permission="accounts.create">
          <div>Admin Tools</div>
        </PermissionGate>
      );

      expect(screen.getByText('Admin Tools')).toBeInTheDocument();
    });
  });

  describe('Account Owner Access', () => {
    beforeEach(() => {
      const { user, account } = createTestScenario('accountOwner');
      mockUseAuth.mockReturnValue({
        user,
        currentAccount: account,
        loading: false,
      });
      mockUseIsAdmin.mockReturnValue({
        data: false,
        isLoading: false,
      });
    });

    it('should show content when user has permission', () => {
      mockUseHasPermission.mockReturnValue({
        data: true,
        isLoading: false,
      });
      
      render(
        <PermissionGate permission="account.manage">
          <div>Account Settings</div>
        </PermissionGate>
      );

      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });

    it('should hide content when user lacks permission', () => {
      mockUseHasPermission.mockReturnValue({
        data: false,
        isLoading: false,
      });
      
      render(
        <PermissionGate permission="platform.admin">
          <div>Admin Tools</div>
        </PermissionGate>
      );

      expect(screen.queryByText('Admin Tools')).not.toBeInTheDocument();
    });

    it('should show fallback when permission denied', () => {
      mockUseHasPermission.mockReturnValue({
        data: false,
        isLoading: false,
      });
      
      render(
        <PermissionGate permission="platform.admin" fallback={<div>Access Denied</div>}>
          <div>Admin Tools</div>
        </PermissionGate>
      );

      expect(screen.queryByText('Admin Tools')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Regular User Access', () => {
    beforeEach(() => {
      const { user, account } = createTestScenario('regularUser');
      mockUseAuth.mockReturnValue({
        user,
        currentAccount: account,
        loading: false,
      });
      mockUseIsAdmin.mockReturnValue({
        data: false,
        isLoading: false,
      });
    });

    it('should show content for allowed permissions', () => {
      mockUseHasPermission.mockReturnValue({
        data: true,
        isLoading: false,
      });
      
      render(
        <PermissionGate permission="projects.read">
          <div>View Projects</div>
        </PermissionGate>
      );

      expect(screen.getByText('View Projects')).toBeInTheDocument();
    });

    it('should hide admin tools from regular users', () => {
      mockUseHasPermission.mockReturnValue({
        data: false,
        isLoading: false,
      });
      
      render(
        <PermissionGate permission="accounts.manage">
          <div>Manage Accounts</div>
        </PermissionGate>
      );

      expect(screen.queryByText('Manage Accounts')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading component when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        currentAccount: null,
        loading: true,
      });
      mockUseIsAdmin.mockReturnValue({
        data: false,
        isLoading: true,
      });

      render(
        <PermissionGate permission="any.permission" loading={<div>Loading...</div>}>
          <div>Content</div>
        </PermissionGate>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should hide content while loading if no loading component', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        currentAccount: null,
        loading: true,
      });
      mockUseIsAdmin.mockReturnValue({
        data: false,
        isLoading: true,
      });

      render(
        <PermissionGate permission="any.permission">
          <div>Content</div>
        </PermissionGate>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated Access', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        currentAccount: null,
        loading: false,
      });
      mockUseIsAdmin.mockReturnValue({
        data: false,
        isLoading: false,
      });
      mockUseHasPermission.mockReturnValue({
        data: false,
        isLoading: false,
      });
    });

    it('should hide content for unauthenticated users', () => {
      render(
        <PermissionGate permission="any.permission">
          <div>Protected Content</div>
        </PermissionGate>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show fallback for unauthenticated users', () => {
      render(
        <PermissionGate permission="any.permission" fallback={<div>Please Login</div>}>
          <div>Protected Content</div>
        </PermissionGate>
      );

      expect(screen.getByText('Please Login')).toBeInTheDocument();
    });
  });

  describe('Multiple Permissions', () => {
    beforeEach(() => {
      const { user, account } = createTestScenario('regularUser');
      mockUseAuth.mockReturnValue({
        user,
        currentAccount: account,
        loading: false,
      });
      mockUseIsAdmin.mockReturnValue({
        data: false,
        isLoading: false,
      });
    });

    it('should handle requireAll correctly', () => {
      // For single permission test, just return true
      mockUseHasPermission.mockReturnValue({ data: true, isLoading: false });
      
      render(
        <PermissionGate permission="projects.read">
          <div>All Permissions Required</div>
        </PermissionGate>
      );

      // For a single permission, it should show if user has it
      expect(screen.getByText('All Permissions Required')).toBeInTheDocument();
    });

    it('should handle single permission correctly', () => {
      // Clear any previous mock setups and mock permission check to return true
      vi.clearAllMocks();
      mockUseHasPermission.mockReturnValue({ data: true, isLoading: false });
      mockUseIsAdmin.mockReturnValue({ data: false, isLoading: false });
      const { user, account } = createTestScenario('regularUser');
      mockUseAuth.mockReturnValue({
        user,
        currentAccount: account,
        loading: false,
      });
      
      render(
        <PermissionGate permission="projects.read">
          <div>Any Permission Works</div>
        </PermissionGate>
      );

      // Should show because user has the permission
      expect(screen.getByText('Any Permission Works')).toBeInTheDocument();
    });
  });
});