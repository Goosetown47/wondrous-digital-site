'use client';

import React, { useState, useEffect } from 'react';
import { PrimarySidebar } from '@/components/navigation/primary-sidebar-new';
import { SecondarySidebar } from '@/components/navigation/secondary-sidebar-new';
import { MobileMenu } from '@/components/navigation/mobile-menu';
import { AuthProvider } from '@/providers/auth-provider';
import { ModuleThemeProvider } from '@/components/providers/module-theme-provider';
import { useIsAdmin } from '@/hooks/useRole';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: isAdmin } = useIsAdmin();
  // Start with false on both server and client to avoid hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load the saved preference after hydration
  useEffect(() => {
    const savedState = localStorage.getItem('secondary-sidebar-collapsed') === 'true';
    setIsCollapsed(savedState);
    setIsHydrated(true);
  }, []);

  // Save the preference when it changes (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('secondary-sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed, isHydrated]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <>
      {/* Mobile Menu - Only visible on small screens */}
      <MobileMenu />
      
      <div className="relative flex h-screen w-full bg-[#EFEFEF]">
        {/* Primary Sidebar - 75px wide, black - Hidden on mobile */}
        <div className="hidden lg:block">
          <PrimarySidebar isAdmin={isAdmin} />
        </div>
        
        {/* Secondary Sidebar - 300px when expanded, collapsible - Hidden on mobile */}
        <div className="hidden lg:block">
          <SecondarySidebar isCollapsed={isCollapsed} />
        </div>
        
        {/* Main Content Area - flush with edges when collapsed, 25px rounded corners when expanded */}
        <main className={`flex-1 bg-white overflow-hidden relative transition-all duration-300 ${
          isCollapsed ? 'lg:rounded-l-none' : 'lg:rounded-l-[25px]'
        }`}>
        {/* Collapse Toggle Button - Top left of content area - Hidden on mobile */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:block absolute top-4 left-4 z-50 p-1.5 hover:bg-gray-100 rounded transition-colors"
        >
          {isCollapsed ? (
            <PanelRightClose className="w-5 h-5 text-gray-600" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-gray-600" />
          )}
        </button>
        
        <div className="h-full overflow-y-auto">
          <div className="p-14">
            {children}
          </div>
        </div>
      </main>
      </div>
    </>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ModuleThemeProvider>
        <AppLayoutContent>
          {children}
        </AppLayoutContent>
      </ModuleThemeProvider>
    </AuthProvider>
  );
}