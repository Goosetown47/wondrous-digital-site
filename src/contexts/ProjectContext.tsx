import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabase';

// Types
export interface Customer {
  id: string;
  business_name: string;
}

export interface Project {
  id: string;
  project_name: string;
  domain: string | null;
  project_type: 'template' | 'customer_site' | 'main_site' | 'landing_page';
  customer_id: string | null;
  niche: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'customer';
  customer_id: string | null;
}

interface ProjectContextType {
  // User profile
  userProfile: UserProfile | null;
  
  // Account and project data
  accounts: Customer[];
  projects: Project[];
  filteredProjects: Project[];
  
  // Selected items
  selectedAccount: Customer | null;
  selectedProject: Project | null;
  
  // Loading state
  loading: boolean;
  projectSwitching: boolean;
  
  // Actions
  setSelectedAccount: (account: Customer) => Promise<void>;
  setSelectedProject: (project: Project) => Promise<void>;
}

// Create the context with default values
export const ProjectContext = createContext<ProjectContextType>({
  // User profile
  userProfile: null,
  
  // Account and project data
  accounts: [],
  projects: [],
  filteredProjects: [],
  
  // Selected items
  selectedAccount: null,
  selectedProject: null,
  
  // Loading state
  loading: true,
  projectSwitching: false,
  
  // Actions (empty implementations)
  setSelectedAccount: async () => {},
  setSelectedProject: async () => {},
});

// Create a hook for using the context
export const useProject = () => useContext(ProjectContext);

// Provider component
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User profile and data states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Selected states
  const [selectedAccount, setSelectedAccount] = useState<Customer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [projectSwitching, setProjectSwitching] = useState<boolean>(false);

  // Initial data loading
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Get user profile with role information
        const { data: profile, error } = await supabase
          .from('users')
          .select('id, email, full_name, role, customer_id')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserProfile(profile);

        // Fetch accounts and projects
        await fetchAccountsAndProjects(profile);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Fetch accounts and projects based on user role
  async function fetchAccountsAndProjects(profile: UserProfile) {
    try {
      let accountsData: Customer[] = [];
      
      // Determine which accounts to fetch based on user role
      if (profile.role === 'admin') {
        // Admins can see all customers + Wondrous Digital for templates
        const { data, error } = await supabase
          .from('customers')
          .select('id, business_name')
          .order('business_name');
          
        if (error) throw error;
        accountsData = data || [];
      } else {
        // Regular users can only see their customer
        if (profile.customer_id) {
          const { data, error } = await supabase
            .from('customers')
            .select('id, business_name')
            .eq('id', profile.customer_id)
            .single();
            
          if (error) throw error;
          accountsData = data ? [data] : [];
        }
      }
      
      // Set accounts
      setAccounts(accountsData);
      
      // Fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, project_name, customer_id, domain, project_type, niche')
        .order('project_name');
        
      if (projectsError) throw projectsError;
      
      setProjects(projectsData || []);
      
      // Set default selections based on user role
      if (accountsData.length > 0) {
        // Find Wondrous Digital account for admin default
        const wondrousAccount = profile.role === 'admin'
          ? accountsData.find(a => a.business_name === 'Wondrous Digital')
          : null;
          
        // Set default account
        const defaultAccount = wondrousAccount || accountsData[0];
        
        // Filter projects for the selected account
        const accountProjects = filterProjectsForAccount(projectsData || [], defaultAccount.id);
        setFilteredProjects(accountProjects);
        
        // Set default project
        if (accountProjects.length > 0) {
          setSelectedProject(accountProjects[0]);
        }
        
        // Set selected account after filtering projects to avoid race condition
        setSelectedAccount(defaultAccount);
      }
    } catch (error) {
      console.error('Error fetching accounts and projects:', error);
    }
  }
  
  // Filter projects based on selected account
  function filterProjectsForAccount(allProjects: Project[], accountId: string) {
    if (!accountId) return [];
    
    // For Wondrous Digital, show template projects
    const wondrousAccount = accounts.find(a => a.business_name === 'Wondrous Digital');
    
    if (wondrousAccount && accountId === wondrousAccount.id) {
      // For Wondrous Digital account, include all projects owned by Wondrous Digital (customer_id matches wondrous_id)
      // AND explicitly include the 'Marketing Website' project if its customer_id is null or not matching
      return allProjects.filter(p => 
        p.customer_id === accountId || 
        p.project_type === 'template' ||
        (p.project_name === 'Marketing Website' && p.project_type === 'main_site')
      );
    }
    
    // For customer accounts, show their projects
    return allProjects.filter(p => p.customer_id === accountId);
  }

  // Handler for changing selected account
  const handleAccountChange = async (account: Customer) => {
    try {
      setProjectSwitching(true);
      
      // Filter projects for this account
      const accountProjects = filterProjectsForAccount(projects, account.id);
      setFilteredProjects(accountProjects);
      
      // Set first project as selected
      if (accountProjects.length > 0) {
        setSelectedProject(accountProjects[0]);
      } else {
        setSelectedProject(null);
      }
      
      // Update selected account
      setSelectedAccount(account);
      
      console.log(`Switched to account: ${account.business_name}`);
    } catch (error) {
      console.error('Error changing account:', error);
    } finally {
      setProjectSwitching(false);
    }
  };

  // Handler for changing selected project
  const handleProjectChange = async (project: Project) => {
    try {
      setProjectSwitching(true);
      setSelectedProject(project);
      console.log(`Switched to project: ${project.project_name}`);
    } catch (error) {
      console.error('Error changing project:', error);
    } finally {
      setProjectSwitching(false);
    }
  };

  // Context value
  const contextValue: ProjectContextType = {
    // User profile
    userProfile,
    
    // Account and project data
    accounts,
    projects,
    filteredProjects,
    
    // Selected items
    selectedAccount,
    selectedProject,
    
    // Loading states
    loading,
    projectSwitching,
    
    // Actions
    setSelectedAccount: handleAccountChange,
    setSelectedProject: handleProjectChange,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};