import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import TopNavigation from './TopNavigation';
import { ProjectProvider, useProject } from '../../contexts/ProjectContext';
import { supabase } from '../../utils/supabase';
import { 
  Bell, 
  ArrowLeft, 
  Home, 
  FileText, 
  ExternalLink, 
  Settings, 
  ChevronRight,
  LogOut,
  ChevronDown,
  Menu, 
  Wrench,
  X
} from 'lucide-react';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useProject();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  // Determine the active section based on the current URL
  React.useEffect(() => {
    if (location.pathname.includes('/dashboard/content')) {
      setActiveSection('content');
    } else if (location.pathname.includes('/dashboard/tools')) {
      setActiveSection('tools');
    } else if (location.pathname.includes('/dashboard/settings')) {
      setActiveSection('settings');
    } else {
      setActiveSection('dashboard');
    }
  }, [location.pathname]);

  // Navigation items
  const mainNavItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      subItems: [
        { name: 'Overview', path: '/dashboard' }
      ]
    },
    { 
      id: 'content', 
      name: 'Content', 
      icon: FileText, 
      path: '/dashboard/content',
      subItems: [
        { name: 'Project', path: '/dashboard/content/project' },
        { name: 'Blog Posts', path: '/dashboard/content/blog' },
        { name: 'Pages', path: '/dashboard/content/pages' },
        { name: 'Site Styles', path: '/dashboard/content/site-styles' }
      ]
    },
    { 
      id: 'tools', 
      name: 'Tools', 
      icon: ExternalLink, 
      path: '/dashboard/tools',
      subItems: [
        { name: 'Marketing', path: '/dashboard/tools/marketing' },
        { name: 'SEO', path: '/dashboard/tools/seo' },
      ]
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: Settings, 
      path: '/dashboard/settings',
      subItems: [
        { name: 'Account', path: '/dashboard/settings/account' },
        { name: 'Billing', path: '/dashboard/settings/account/billing' }
      ]
    }
  ];

  // Admin-only navigation items
  const adminNavItems = [
    { 
      id: 'adminTools', 
      name: 'Admin Tools', 
      icon: Wrench, 
      path: '/dashboard/admin',
      subItems: [
        { name: 'Section Library', path: '/dashboard/admin/section-library' }
      ]
    }
  ];

  // Find the active main item based on current activeSection
  const activeMainItem = mainNavItems.find(item => item.id === activeSection);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation - Full width */}
      <TopNavigation 
        activeSection={activeMainItem?.name || 'Dashboard'} 
        onOpenMobileMenu={() => setMobileMenuOpen(true)} 
      />
        
      <div className="flex flex-1 relative">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`${
          mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:flex'
        } fixed top-16 bottom-0 left-0 z-30 flex-col ${
          isSidebarExpanded ? 'w-64' : 'w-16'
        } bg-gray-900 text-white transition-all duration-300 ease-in-out overflow-x-hidden`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {/* Sidebar Header with Logo */}
        {/* Mobile close button */}
        <button
          className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-gray-800 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
        
        {/* Main Navigation */}
        <div className="flex-1 pt-16 pb-4 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-1 px-2">
            {[...mainNavItems, ...(userProfile?.role === 'admin' ? adminNavItems : [])].map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    // If this item has subitems, navigate to the first subitem
                    // This ensures we always navigate to a valid route
                    if (item.subItems && item.subItems.length > 0) {
                      navigate(item.subItems[0].path);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${
                    ''
                  } ${
                    isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`${isSidebarExpanded ? 'opacity-100 pl-3' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 whitespace-nowrap`}>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
          >
            <div className="flex items-center justify-center">
              <LogOut className="h-5 w-5" />
            </div>
            <span className={`${isSidebarExpanded ? 'opacity-100 pl-3' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 whitespace-nowrap`}>Sign Out</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ml-0 lg:ml-16 transition-all duration-300 ease-in-out pt-0 ${
          location.pathname.includes('/dashboard/content/pages/builder/') ? 'h-full' : ''
        }`}>
        {/* Sub-navigation and Content */}
        <div className={`flex flex-1 overflow-visible ${
          location.pathname.includes('/dashboard/content/pages/builder/') ? 'h-full' : ''
        }`}>
          {/* Sub-navigation sidebar */}
          {activeMainItem && activeMainItem.subItems.length > 1 && (
            <div className="hidden lg:block w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto">
              <div className="py-4">
                <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {activeMainItem.name}
                </div>
                <nav className="space-y-1 px-2">
                  {activeMainItem.subItems.map((subItem, index) => (
                    <Link
                      key={index}
                      to={subItem.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-md ${
                        location.pathname === subItem.path
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-700 hover:bg-white hover:text-gray-900'
                      }`}
                    >
                      <span>{subItem.name}</span>
                      <ChevronRight className={`ml-auto h-4 w-4 ${
                        location.pathname === subItem.path
                          ? 'text-gray-500' 
                          : 'text-gray-400'
                      }`} />
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          )}
          {/* Main content area */}
          <div className="flex-1 relative">
            <div className={location.pathname.startsWith('/dashboard/content/pages/builder') ? 'h-full' : 'py-6 px-4 sm:px-6 lg:px-8'}>
              <Outlet />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the component with ProjectProvider
const AppLayoutWithProvider: React.FC = () => (
  <ProjectProvider>
    <AppLayout />
  </ProjectProvider>
);

export default AppLayoutWithProvider;