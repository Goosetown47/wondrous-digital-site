'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

const AuthContext = createContext<AuthContextType>({
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

  // Fetch accounts for the current user
  const fetchAccounts = async () => {
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
  };

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
  }, [user]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentAccount(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle account change - clear project selection
  const handleSetCurrentAccount = (account: Account | null) => {
    setCurrentAccount(account);
    setCurrentProject(null); // Clear project when account changes
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
      setCurrentProject,
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