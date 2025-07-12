import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ArrowLeft,
  ChevronDown,
  Menu,
  User,
  Layers,
  Settings,
  LogOut,
  CheckCircle
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { supabase } from '../../utils/supabase';

interface TopNavigationProps {
  activeSection: string;
  onOpenMobileMenu: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  activeSection,
  onOpenMobileMenu
}) => {
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Get project context
  const { 
    userProfile, 
    accounts, 
    filteredProjects, 
    selectedAccount, 
    selectedProject, 
    loading, 
    projectSwitching,
    setSelectedAccount, 
    setSelectedProject 
  } = useProject();
  
  const closeAllDropdowns = (e: React.MouseEvent) => {
    // Only close if clicking outside dropdown areas
    const target = e.target as HTMLElement;
    if (!target.closest('.account-dropdown') && !target.closest('.project-dropdown') && !target.closest('.user-dropdown')) {
      setAccountDropdownOpen(false);
      setProjectDropdownOpen(false);
      setUserDropdownOpen(false);
    }
  };
  
  // Attach click event to document body when component mounts
  React.useEffect(() => {
    document.body.addEventListener('click', closeAllDropdowns as any);
    return () => {
      document.body.removeEventListener('click', closeAllDropdowns as any);
    };
  }, []);

  return (
    <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center px-4 z-40 sticky top-0 shadow-sm w-full">
      <div className="w-full flex items-center justify-between">
        {/* Left side - Hamburger menu for mobile */}
        <div className="flex items-center">
          <button
            className="p-1.5 rounded-md hover:bg-gray-800 lg:hidden"
            onClick={onOpenMobileMenu}
          >
            <Menu className="h-5 w-5 text-white" />
          </button>

          {/* Account/Project Selection */}
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center mr-4">
              <img
                src="/Logo-W180x180-DigitalAgency.png"
                alt="Wondrous Digital"
                className="h-8 w-auto"
              />
            </Link>
            
            {/* Account Dropdown */}
            <div className="relative account-dropdown">
              <button
                onClick={(e) => {
                  if (!loading && !projectSwitching) {
                    e.stopPropagation();
                    setAccountDropdownOpen(!accountDropdownOpen);
                    setProjectDropdownOpen(false);
                    setUserDropdownOpen(false);
                  }
                }}
                className={`flex items-center space-x-1.5 text-white hover:text-gray-200 transition-colors pr-1.5 ${(loading || projectSwitching) ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium truncate max-w-[120px]">
                  {loading ? 'Loading...' : projectSwitching ? 'Switching...' : selectedAccount?.business_name || 'Select Account'}
                  </span>
                  {selectedAccount?.business_name === 'Wondrous Digital' && userProfile?.role === 'admin' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">Admin</span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {accountDropdownOpen && !loading && accounts.length > 0 && (
                <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 animate-in fade-in">
                  <div className="py-1">
                    {accounts.map(account => (
                      <button
                        key={account.id}
                        onClick={() => setSelectedAccount(account)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          {account.business_name}
                          {account.business_name === 'Wondrous Digital' && userProfile?.role === 'admin' && 
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">Admin</span>
                          }
                        </div>
                        {account.id === selectedAccount?.id && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Separator */}
            <span className="text-gray-600 mx-2">/</span>
            
            {/* Project Dropdown */}
            <div className="relative project-dropdown">
              <button
                onClick={(e) => {
                  if (!loading && !projectSwitching && selectedAccount) {
                    e.stopPropagation();
                    setProjectDropdownOpen(!projectDropdownOpen);
                    setAccountDropdownOpen(false);
                    setUserDropdownOpen(false);
                  }
                }}
                className={`flex items-center space-x-1.5 text-white hover:text-gray-200 transition-colors ${(loading || projectSwitching || !selectedAccount) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {loading ? 'Loading...' : projectSwitching ? 'Switching...' : selectedProject?.project_name || 'Select Project'}
                  </span>
                  {selectedProject && (
                    <span className={`ml-2 text-xs rounded-full px-2 py-0.5 ${
                      selectedProject.project_type === 'template' 
                        ? 'bg-purple-100 text-purple-800' 
                        : selectedProject.project_type === 'main_site'
                        ? 'bg-green-100 text-green-800'
                        : selectedProject.project_type === 'landing_page'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedProject.project_type === 'template' 
                        ? 'Template' 
                        : selectedProject.project_type === 'main_site' 
                        ? 'Main' 
                        : selectedProject.project_type === 'landing_page'
                        ? 'Landing'
                        : 'Site'}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {projectDropdownOpen && !loading && filteredProjects.length > 0 && (
                <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 animate-in fade-in">
                  <div className="py-1">
                    {filteredProjects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <Layers className="h-4 w-4 mr-2 text-gray-500" />
                            {project.project_name}
                            {project.project_type === 'template' ? (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5">Template</span>
                            ) : project.project_type === 'main_site' ? (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">Main</span>
                            ) : project.project_type === 'landing_page' ? (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-800 rounded-full px-2 py-0.5">Landing</span>
                            ) : (
                              <span className="ml-2 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5">Site</span>
                            )}
                          </div>
                          {project.id === selectedProject?.id && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Secondary navigation title */}
        <div className="hidden lg:block ml-6 font-medium text-white">
          {activeSection}
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* Back to website link */}
          <Link 
            to="/" 
            className="text-white hover:text-gray-200 flex items-center space-x-1 text-sm"
            title="Back to Website"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Website</span>
          </Link>

          {/* Notifications */}
          <button 
            className="p-1.5 rounded-full text-white hover:bg-gray-800 focus:outline-none transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              // Handle notifications
            }}
          >
            <Bell className="h-5 w-5" />
          </button>
          
          {/* User menu dropdown */}
          <div className="relative user-dropdown">
            <button 
              className="flex items-center space-x-1"
              onClick={(e) => {
                e.stopPropagation();
                setUserDropdownOpen(!userDropdownOpen);
                setAccountDropdownOpen(false);
                setProjectDropdownOpen(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F867AC] to-[#3C33C0] flex items-center justify-center text-white text-sm font-medium">
                U
              </div>
              <ChevronDown className="h-4 w-4 text-white" />
            </button>
            
            {/* User dropdown menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 animate-in fade-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userProfile?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{userProfile?.email || ''}</p>
                </div>
                <a href="/dashboard/settings/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                  Account Settings
                </a>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                      window.location.href = '/login';
                    } catch (error) {
                      console.error('Error signing out:', error);
                    }
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;