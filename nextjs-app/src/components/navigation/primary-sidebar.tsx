'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { 
  LayoutDashboard, 
  Palette, 
  Shield, 
  HelpCircle, 
  User 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type ModuleType = 'dashboard' | 'builder' | 'admin';

interface ModuleItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  href: string;
}

interface PrimarySidebarProps {
  isAdmin?: boolean;
}

export function PrimarySidebar({ isAdmin = true }: PrimarySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentModule, setModule, getCurrentModuleColors } = useModuleThemeStore();
  const [isMobile, setIsMobile] = useState(false);

  // Module definitions
  const modules: ModuleItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'builder',
      label: 'Builder',
      icon: Palette,
      href: '/builder',
    },
    ...(isAdmin ? [{
      id: 'admin' as ModuleType,
      label: 'Admin',
      icon: Shield,
      href: '/admin',
    }] : []),
  ], [isAdmin]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Restore last selected module on mount
  useEffect(() => {
    const lastModule = localStorage.getItem('last-selected-module') as ModuleType;
    if (lastModule && modules.find(m => m.id === lastModule)) {
      setModule(lastModule);
    }
  }, [modules, setModule]);

  // Update module based on current path
  useEffect(() => {
    // Admin module paths include /admin, /lab, /library, /core, /tools
    const isAdminPath = pathname.startsWith('/admin') || 
                       pathname.startsWith('/lab') || 
                       pathname.startsWith('/library') || 
                       pathname.startsWith('/core') || 
                       pathname.startsWith('/tools') ||
                       pathname.startsWith('/app/admins');
    
    if (pathname.startsWith('/dashboard')) {
      setModule('dashboard');
    } else if (pathname.startsWith('/builder')) {
      setModule('builder');
    } else if (isAdminPath) {
      setModule('admin');
    }
  }, [pathname, setModule]);

  const handleModuleClick = (module: ModuleItem) => {
    setModule(module.id);
    localStorage.setItem('last-selected-module', module.id);
    router.push(module.href);
  };

  const colors = getCurrentModuleColors();

  return (
    <TooltipProvider>
      <div 
        data-testid="primary-sidebar"
        className={cn(
          'w-[75px] h-screen bg-black flex flex-col items-center py-4',
          'hidden md:flex', // Hidden on mobile, visible on desktop
          isMobile && 'hidden'
        )}
      >
        {/* Logo */}
        <div className="mb-8">
          <div 
            aria-label="Wondrous Digital"
            className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-black text-xl"
          >
            W
          </div>
        </div>

        {/* Module Icons */}
        <nav className="flex-1 flex flex-col gap-4">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = currentModule === module.id;
            
            return (
              <Tooltip key={module.id}>
                <TooltipTrigger asChild>
                  <button
                    aria-label={module.label}
                    onClick={() => handleModuleClick(module)}
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center transition-all',
                      'text-white hover:text-module-primary',
                      isActive && 'bg-module-primary text-white'
                    )}
                    style={{
                      backgroundColor: isActive ? colors.primary : 'transparent',
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{module.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Footer Icons */}
        <div data-testid="sidebar-footer" className="flex flex-col gap-4 mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Help"
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white hover:bg-gray-800 transition-all"
              >
                <HelpCircle className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Help & Support</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Profile"
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white hover:bg-gray-800 transition-all"
              >
                <User className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Profile Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}