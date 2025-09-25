'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Account, Project } from '@/types/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accounts: Account[];
  isAdmin: boolean;
  currentAccount: Account | null;
  setCurrentAccount: (account: Account | null) => void;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  signOut: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accounts: [],
  isAdmin: false,
  currentAccount: null,
  setCurrentAccount: () => {},
  currentProject: null,
  setCurrentProject: () => {},
  signOut: async () => {},
  refreshAccounts: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const router = useRouter();

  // Load persisted selections from localStorage on mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem('currentAccountId');
    const savedProjectId = localStorage.getItem('currentProjectId');
    const savedAccount = localStorage.getItem('currentAccount');
    const savedProject = localStorage.getItem('currentProject');

    if (savedAccount && savedAccountId) {
      try {
        const account = JSON.parse(savedAccount);
        if (account.id === savedAccountId) {
          setCurrentAccount(account);
        }
      } catch (e) {
        console.error('Error loading saved account:', e);
      }
    }

    if (savedProject && savedProjectId) {
      try {
        const project = JSON.parse(savedProject);
        if (project.id === savedProjectId) {
          setCurrentProject(project);
        }
      } catch (e) {
        console.error('Error loading saved project:', e);
      }
    }
  }, []);

  // Fetch accounts for the current user
  const fetchAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setIsAdmin(false);
      return;
    }

    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const userAccounts = await response.json();
        setAccounts(userAccounts);

        // Check if user is admin (has platform account access)
        const adminCheckResponse = await fetch('/api/platform/admins');
        setIsAdmin(adminCheckResponse.ok);

        // Set current account if not set
        if (!currentAccount && userAccounts.length > 0) {
          setCurrentAccount(userAccounts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, [user, currentAccount]);

  useEffect(() => {
    // Check active sessions and sets the user
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Don't fetch accounts here - let another effect handle it
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        // Handle auth events
        if (event === 'SIGNED_IN') {
          // Refresh the page to update server-side data
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          // Redirect to login
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  // Fetch accounts when user changes
  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setCurrentAccount(null);
      setIsAdmin(false);
    }
  }, [user, fetchAccounts]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentAccount(null);
      setCurrentProject(null);

      // Clear persisted selections
      localStorage.removeItem('currentAccountId');
      localStorage.removeItem('currentAccount');
      localStorage.removeItem('currentProjectId');
      localStorage.removeItem('currentProject');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle account change - clear project selection and persist
  const handleSetCurrentAccount = (account: Account | null) => {
    setCurrentAccount(account);
    setCurrentProject(null); // Clear project when account changes

    // Persist to localStorage
    if (account) {
      localStorage.setItem('currentAccountId', account.id);
      localStorage.setItem('currentAccount', JSON.stringify(account));
      localStorage.removeItem('currentProjectId');
      localStorage.removeItem('currentProject');
    } else {
      localStorage.removeItem('currentAccountId');
      localStorage.removeItem('currentAccount');
      localStorage.removeItem('currentProjectId');
      localStorage.removeItem('currentProject');
    }
  };

  // Handle project change and persist
  const handleSetCurrentProject = (project: Project | null) => {
    setCurrentProject(project);

    // Persist to localStorage
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
      localStorage.setItem('currentProject', JSON.stringify(project));
    } else {
      localStorage.removeItem('currentProjectId');
      localStorage.removeItem('currentProject');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      accounts,
      isAdmin, 
      currentAccount, 
      setCurrentAccount: handleSetCurrentAccount, 
      currentProject,
      setCurrentProject: handleSetCurrentProject,
      signOut,
      refreshAccounts: fetchAccounts
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

