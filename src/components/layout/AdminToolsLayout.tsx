import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const AdminToolsLayout = () => {
  const location = useLocation();

  // Navigation items for Admin Tools
  const adminNavItems = [
    { name: 'Accounts Management', path: '/dashboard/admin/accounts' },
    { name: 'Projects', path: '/dashboard/admin/projects' },
    { name: 'Templates', path: '/dashboard/admin/templates' },
    { name: 'Section Library', path: '/dashboard/admin/section-library' },
    { name: 'Staging', path: '/dashboard/admin/staging' },
    { name: 'Database Settings', path: '/dashboard/admin/database-settings' }
  ];

  return (
    <div className="flex flex-1 h-full">
      {/* Secondary sidebar for Admin Tools */}
      <div className="hidden lg:block w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="py-4">
          <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Admin Tools
          </div>
          <nav className="space-y-1 px-2">
            {adminNavItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm rounded-md ${
                  location.pathname === item.path
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:bg-white hover:text-gray-900'
                }`}
              >
                <span>{item.name}</span>
                <ChevronRight className={`ml-auto h-4 w-4 ${
                  location.pathname === item.path
                    ? 'text-gray-500' 
                    : 'text-gray-400'
                }`} />
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-visible">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminToolsLayout;