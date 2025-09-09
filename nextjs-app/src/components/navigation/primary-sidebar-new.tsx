'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { 
  LayoutDashboard, 
  Blocks, 
  ShieldUser, 
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  BookOpen,
  GitPullRequest,
  Map,
  Bug,
  Headphones
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/auth-provider';
import { RoleBadge } from '@/components/ui/role-badge';
import { useAccountRole } from '@/hooks/useRole';

type ModuleType = 'dashboard' | 'builder' | 'admin';

interface ModuleConfig {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

interface PrimarySidebarProps {
  isAdmin?: boolean;
}

export function PrimarySidebar({ isAdmin = true }: PrimarySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentModule, setModule } = useModuleThemeStore();
  const { data: userProfile } = useUserProfile();
  const { signOut, user } = useAuth();
  const { data: accountRole } = useAccountRole();

  // Module configurations
  const modules: ModuleConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      color: '#EFEFEF',  // Changed to match design
    },
    {
      id: 'builder',
      label: 'Builder',
      icon: Blocks,
      href: '/builder',
      color: '#AA60C4',
    },
    ...(isAdmin ? [{
      id: 'admin' as ModuleType,
      label: 'Admin',
      icon: ShieldUser,
      href: '/admin',
      color: '#E382A5',
    }] : []),
  ];

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
    } else if (isAdminPath && isAdmin) {
      setModule('admin');
    }
  }, [pathname, setModule, isAdmin]);

  const handleModuleClick = (module: ModuleConfig) => {
    setModule(module.id);
    router.push(module.href);
  };


  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (userProfile?.display_name) {
      return userProfile.display_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <TooltipProvider>
      <div className="w-[75px] h-screen bg-black flex flex-col items-center">
        {/* Logo */}
        <div className="pt-4 w-full flex flex-col items-center">
          <div className="mb-[30px]">
            <Image 
              src="/images/wondrous-logo.png" 
              alt="Wondrous" 
              width={50} 
              height={50} 
              className="rounded-lg"
            />
          </div>
          {/* Divider under logo */}
          <div className="w-[45px] h-[1px] bg-[#404040]" />
        </div>

        {/* Module Icons - Top aligned */}
        <div className="flex flex-col items-center gap-3 mt-[30px]">
          {modules.filter(m => m.id !== 'admin').map((module) => {
            const Icon = module.icon;
            const isActive = currentModule === module.id;
            
            return (
              <Tooltip key={module.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleModuleClick(module)}
                    className={cn(
                      'w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all duration-200',
                      !isActive && 'bg-[#2F2F2D]',
                      'hover:opacity-80'
                    )}
                    style={{
                      backgroundColor: isActive 
                        ? module.color
                        : '#2F2F2D',
                    }}
                  >
                    <Icon className={cn(
                      'w-[18px] h-[18px]',
                      isActive && module.id === 'dashboard' ? 'text-black' : 'text-white'
                    )} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{module.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Divider before admin module if admin */}
        {isAdmin && (
          <div className="w-[45px] h-[1px] bg-[#404040] mt-[30px] mb-[30px]" />
        )}

        {/* Admin module - separated */}
        {isAdmin && (
          <div className="flex flex-col items-center">
            {modules.filter(m => m.id === 'admin').map((module) => {
              const Icon = module.icon;
              const isActive = currentModule === module.id;
              
              return (
                <Tooltip key={module.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleModuleClick(module)}
                      className={cn(
                        'w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all duration-200',
                        !isActive && 'bg-[#2F2F2D]',
                        'hover:opacity-80'
                      )}
                      style={{
                        backgroundColor: isActive ? module.color : '#2F2F2D',
                      }}
                    >
                      <Icon className={cn(
                        'w-[18px] h-[18px]',
                        'text-white'
                      )} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{module.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Icons */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-[42px] h-[42px] rounded-full bg-[#2F2F2D] flex items-center justify-center text-white hover:opacity-80 transition-all duration-200">
                <HelpCircle className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-56 bg-[#2F2F2D] text-white border-gray-800">
              <DropdownMenuItem 
                onClick={() => window.open('https://docs.wondrousdigital.com', '_blank')}
                className="hover:bg-gray-800 cursor-pointer flex items-center py-2.5"
              >
                <BookOpen className="mr-3 h-4 w-4" />
                Read Documentation
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/request')}
                className="hover:bg-gray-800 cursor-pointer flex items-center py-2.5"
              >
                <GitPullRequest className="mr-3 h-4 w-4" />
                Make a Request
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.open('https://roadmap.wondrousdigital.com', '_blank')}
                className="hover:bg-gray-800 cursor-pointer flex items-center py-2.5"
              >
                <Map className="mr-3 h-4 w-4" />
                View our Roadmap
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/report')}
                className="hover:bg-gray-800 cursor-pointer flex items-center py-2.5"
              >
                <Bug className="mr-3 h-4 w-4" />
                Report a Problem
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/support')}
                className="hover:bg-gray-800 cursor-pointer flex items-center py-2.5"
              >
                <Headphones className="mr-3 h-4 w-4" />
                Get Support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userProfile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gray-700 text-white text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-64 bg-[#2F2F2D] text-white border-gray-800">
              <DropdownMenuLabel className="text-gray-400 text-xs font-normal">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile')}
                className="hover:bg-gray-800 cursor-pointer flex items-center py-2.5"
              >
                <Settings className="mr-3 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/security')}
                className="hover:bg-gray-800 cursor-pointer flex items-center py-2.5"
              >
                <Shield className="mr-3 h-4 w-4" />
                Security
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={signOut}
                className="hover:bg-gray-800 cursor-pointer flex items-center py-2.5"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <div className="px-2 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gray-700 text-white text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {userProfile?.display_name || 'User'}
                      </p>
                      {accountRole && (
                        <RoleBadge role={accountRole} size="sm" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}