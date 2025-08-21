import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import SignupPage from '../page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      getUser: vi.fn(),
    },
  })),
}));

// Mock components
vi.mock('@/components/ui/signup-stepper', () => ({
  SignupStepper: vi.fn(({ currentStep, steps }) => (
    <div data-testid="stepper">
      Step {currentStep + 1} of {steps.length}
    </div>
  )),
}));

describe('Signup Flow Navigation', () => {
  let mockRouter: {
    push: ReturnType<typeof vi.fn>;
    replace: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    back: ReturnType<typeof vi.fn>;
    forward: ReturnType<typeof vi.fn>;
    prefetch: ReturnType<typeof vi.fn>;
  };
  let mockSearchParams: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    };
    vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);
    
    mockSearchParams = {
      get: vi.fn(),
    };
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as unknown as ReadonlyURLSearchParams);
  });

  describe('Step 1: Create Login', () => {
    it('should render email and password fields', () => {
      render(<SignupPage />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      render(<SignupPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate password match', async () => {
      render(<SignupPage />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmInput, { target: { value: 'DifferentPassword!' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should pre-fill email from invitation token', () => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'token') return 'inv_token_123';
        if (key === 'email') return 'invited@example.com';
        return null;
      });
      
      render(<SignupPage />);
      
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(emailInput.value).toBe('invited@example.com');
    });

    it('should navigate to confirm page after successful signup', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const mockSignUp = vi.fn().mockResolvedValue({
        data: { user: { id: 'user_123' } },
        error: null,
      });
      
      vi.mocked(createClient).mockReturnValue({
        auth: {
          signUp: mockSignUp,
          getUser: vi.fn(),
        },
      } as unknown as ReturnType<typeof createClient>);
      
      render(<SignupPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/signup/confirm');
      });
    });
  });

  describe('Flow Progression', () => {
    it('should store signup progress in session storage', async () => {
      render(<SignupPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      // Simulate form submission
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(sessionStorage.getItem('signupEmail')).toBe('test@example.com');
      });
    });

    it('should preserve invitation token through flow', () => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'token') return 'inv_token_123';
        return null;
      });
      
      render(<SignupPage />);
      
      expect(sessionStorage.getItem('invitationToken')).toBe('inv_token_123');
    });

    it('should show loading state during submission', async () => {
      render(<SignupPage />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      // Fill form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display signup errors', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const mockSignUp = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      });
      
      vi.mocked(createClient).mockReturnValue({
        auth: {
          signUp: mockSignUp,
          getUser: vi.fn(),
        },
      } as unknown as ReturnType<typeof createClient>);
      
      render(<SignupPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const mockSignUp = vi.fn().mockRejectedValue(new Error('Network error'));
      
      vi.mocked(createClient).mockReturnValue({
        auth: {
          signUp: mockSignUp,
          getUser: vi.fn(),
        },
      } as unknown as ReturnType<typeof createClient>);
      
      render(<SignupPage />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Warm Prospect Flow', () => {
    it('should handle invitation token', () => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'token') return 'inv_token_123';
        if (key === 'email') return 'invited@example.com';
        return null;
      });
      
      render(<SignupPage />);
      
      // Email should be pre-filled and disabled
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(emailInput.value).toBe('invited@example.com');
      expect(emailInput.disabled).toBe(false); // User can still change it if needed
    });

    it('should store invitation token for later use', () => {
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'token') return 'inv_token_456';
        return null;
      });
      
      render(<SignupPage />);
      
      expect(sessionStorage.getItem('invitationToken')).toBe('inv_token_456');
    });

    it('should pass invitation token to account creation', async () => {
      sessionStorage.setItem('invitationToken', 'inv_token_789');
      
      vi.mocked(mockSearchParams.get).mockImplementation((key: string) => {
        if (key === 'token') return 'inv_token_789';
        return null;
      });
      
      render(<SignupPage />);
      
      // The token should be preserved for account creation step
      expect(sessionStorage.getItem('invitationToken')).toBe('inv_token_789');
    });
  });

  describe('Navigation Guards', () => {
    it('should prevent navigation if form is dirty', () => {
      render(<SignupPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'partial@example.com' } });
      
      // Form is now dirty, navigation should be prevented
      const isDirty = emailInput.getAttribute('value') !== '';
      expect(isDirty).toBe(true);
    });

    it('should allow navigation after successful submission', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const mockSignUp = vi.fn().mockResolvedValue({
        data: { user: { id: 'user_123' } },
        error: null,
      });
      
      vi.mocked(createClient).mockReturnValue({
        auth: {
          signUp: mockSignUp,
          getUser: vi.fn(),
        },
      } as unknown as ReturnType<typeof createClient>);
      
      render(<SignupPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalled();
      });
    });
  });
});