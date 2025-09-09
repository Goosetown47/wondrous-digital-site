'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AccountDropdown } from './AccountDropdown';
import { ProjectDropdown } from './ProjectDropdown';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  Hammer,
  Library,
  Package,
  Settings,
  User,
  Users,
  LogOut,
  CreditCard,
  Palette,
  FileText,
  Archive,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  ClipboardCheck,
  UserCog,
  LayoutGrid,
  Route,
  Brush,
  FileCode,
  BookOpen,
  BarChart3,
  Plug,
  Globe,
  FlaskConical,
  Database,
  Building,
  ShieldCheck,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/auth-provider';
import { SidebarMenuItemComponent } from './sidebar-menu-item';
import { useIsStaff, useIsAdmin, useIsAccountOwner } from '@/hooks/useRole';
import { useUserProfile, useUserRole } from '@/hooks/useUserProfile';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Types imported from database

// Module-specific navigation items
const getDashboardItems = () => [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Updates',
    href: '/dashboard/updates',
    icon: ClipboardCheck,
  },
  {
    title: 'Tasks',
    href: '/dashboard/tasks',
    icon: ListTodo,
  },
];

const getBuilderItems = (projectId: string | null) => {
  if (!projectId) return [];
  
  return [
    {
      title: 'Canvas',
      href: `/builder/${projectId}`,
      icon: LayoutGrid,
    },
    {
      title: 'Pages',
      href: `/builder/${projectId}/pages`,
      icon: FileText,
    },
    {
      title: 'Navigation',
      href: `/builder/${projectId}/navigation`,
      icon: Route,
    },
    {
      title: 'Themes',
      href: `/builder/${projectId}/themes`,
      icon: Brush,
    },
    {
      title: 'Templates',
      href: `/builder/${projectId}/templates`,
      icon: FileCode,
    },
    {
      title: 'Blog',
      href: `/builder/${projectId}/blog`,
      icon: BookOpen,
    },
    {
      title: 'Traffic',
      href: `/builder/${projectId}/traffic`,
      icon: BarChart3,
    },
    {
      title: 'Settings',
      href: `/builder/${projectId}/settings`,
      icon: Settings,
    },
    {
      title: 'Domains',
      href: `/builder/${projectId}/domains`,
      icon: Globe,
    },
    {
      title: 'Integrations',
      href: `/builder/${projectId}/integrations`,
      icon: Plug,
    },
  ];
};

const getAdminItems = () => [
  {
    title: 'Lab',
    href: '/admin/lab',
    icon: FlaskConical,
    subItems: [
      {
        title: 'Drafts',
        href: '/admin/lab',
        icon: FileText,
      },
      {
        title: 'Theme Builder',
        href: '/admin/lab/themes',
        icon: Palette,
      },
    ],
  },
  {
    title: 'Library',
    href: '/admin/library',
    icon: Library,
    subItems: [
      {
        title: 'Sites',
        href: '/admin/library/sites',
        icon: Globe,
      },
      {
        title: 'Pages',
        href: '/admin/library/pages',
        icon: FileText,
      },
      {
        title: 'Sections',
        href: '/admin/library/sections',
        icon: Package,
      },
      {
        title: 'Themes',
        href: '/admin/library/themes',
        icon: Palette,
      },
    ],
  },
  {
    title: 'Core',
    href: '/admin/core',
    icon: Database,
  },
  {
    title: 'Projects',
    href: '/admin/projects',
    icon: Hammer,
  },
  {
    title: 'Accounts',
    href: '/admin/accounts',
    icon: Building,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Types',
    href: '/admin/types',
    icon: Package,
  },
  {
    title: 'Administrators',
    href: '/admin/administrators',
    icon: ShieldCheck,
  },
];

export function SecondarySidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('secondary-sidebar-collapsed') === 'true';
    }
    return false;
  });
  const router = useRouter();
  const { user, signOut: authSignOut, currentProject } = useAuth();
  useIsStaff();
  const { data: isAdmin } = useIsAdmin();
  const { data: isAccountOwner, isLoading: isAccountOwnerLoading } = useIsAccountOwner();
  const { data: userProfile } = useUserProfile();
  const { data: userRole } = useUserRole();
  const { currentModule } = useModuleThemeStore();

  // Persist collapsed state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('secondary-sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };


  const handleSignOut = async () => {
    try {
      await authSignOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userProfile?.display_name) {
      const parts = userProfile.display_name.split(' ');
      return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      const parts = user.email.split('@')[0].split('.');
      return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  // Get module-specific navigation items
  const getModuleItems = () => {
    switch (currentModule) {
      case 'dashboard':
        return getDashboardItems();
      case 'builder':
        return getBuilderItems(currentProject?.id || null);
      case 'admin':
        return isAdmin ? getAdminItems() : [];
      default:
        return getDashboardItems();
    }
  };

  const moduleItems = getModuleItems();

  return (
    <div 
      className={cn(
        'relative h-screen bg-background border-r transition-all duration-300',
        isCollapsed ? 'w-[50px]' : 'w-[300px]'
      )}
    >
      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleCollapsed}
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-background"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <Sidebar className={cn('border-0', isCollapsed && 'w-[50px]')}>
        <SidebarHeader className={cn(isCollapsed && 'px-2')}>
          {!isCollapsed && (
            <>
              <AccountDropdown />
              <ProjectDropdown />
              <Separator className="my-2" />
            </>
          )}
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel>
                {currentModule === 'dashboard' && 'Dashboard'}
                {currentModule === 'builder' && 'Builder'}
                {currentModule === 'admin' && 'Admin'}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {moduleItems.map((item) => (
                  <SidebarMenuItemComponent 
                    key={item.href} 
                    item={item}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        
        {/* Account Management Section for Dashboard Module */}
        {currentModule === 'dashboard' && !isAccountOwnerLoading && isAccountOwner && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              {!isCollapsed && <SidebarGroupLabel>Account Management</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItemComponent 
                    item={{
                      title: 'Team Members',
                      href: '/dashboard/team-members',
                      icon: Users,
                    }}
                    isCollapsed={isCollapsed}
                  />
                  <SidebarMenuItemComponent 
                    item={{
                      title: 'Archived Projects',
                      href: '/dashboard/archived-projects',
                      icon: Archive,
                    }}
                    isCollapsed={isCollapsed}
                  />
                  <SidebarMenuItemComponent 
                    item={{
                      title: 'Billing',
                      href: '/dashboard/billing',
                      icon: CreditCard,
                    }}
                    isCollapsed={isCollapsed}
                  />
                  <SidebarMenuItemComponent 
                    item={{
                      title: 'Account Settings',
                      href: '/dashboard/account-settings',
                      icon: UserCog,
                    }}
                    isCollapsed={isCollapsed}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {!isCollapsed && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full h-auto py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col items-start truncate">
                      <span className="text-sm font-medium">
                        {userProfile?.display_name || user?.email?.split('@')[0] || 'User'}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {userRole === 'Admin' && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                            Admin
                          </Badge>
                        )}
                        {userRole === 'Staff' && (
                          <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0 h-4">
                            Staff
                          </Badge>
                        )}
                        {userRole === 'Account Owner' && (
                          <Badge className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0 h-4">
                            Owner
                          </Badge>
                        )}
                        {userRole === 'User' && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            User
                          </Badge>
                      )}
                      <span className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="top" 
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/users">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Team Members</span>
                  </Link>
                </DropdownMenuItem>
                {isAccountOwner && (
                  <DropdownMenuItem asChild>
                    <Link href="/billing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      )}
    </Sidebar>
    </div>
  );
}