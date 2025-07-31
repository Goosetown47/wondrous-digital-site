'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  ChevronRight,
  Palette,
  Wrench,
  FileText,
  Shield,
  UserCog,
  ClipboardList,
  Archive,
  Briefcase,
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
import { authService } from '@/lib/supabase/auth';
import { useAuth } from '@/providers/auth-provider';
import type { User } from '@supabase/supabase-js';
import { SidebarMenuItemComponent } from './sidebar-menu-item';
import { useIsStaff, useIsAdmin, useIsAccountOwner } from '@/hooks/useRole';

const getNavigationItems = (currentProject: any) => [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  ...(currentProject ? [
    {
      title: 'Builder',
      href: `/builder/${currentProject.id}`,
      icon: Hammer,
      subItems: [
        {
          title: 'Canvas',
          href: `/builder/${currentProject.id}`, // This will redirect to homepage automatically
          icon: Hammer,
        },
        {
          title: 'Pages',
          href: `/builder/${currentProject.id}/pages`,
          icon: FileText,
        },
      ],
    },
    {
      title: 'Settings',
      href: `/project/${currentProject.id}/settings`,
      icon: Settings,
    }
  ] : []),
];

const getStaffItems = () => [
  {
    title: 'Lab',
    href: '/lab',
    icon: Home,
    subItems: [
      {
        title: 'Drafts',
        href: '/lab',
        icon: Home,
      },
      {
        title: 'Theme Builder',
        href: '/lab/themes',
        icon: Palette,
      },
    ],
  },
  {
    title: 'Library',
    href: '/library',
    icon: Library,
  },
  {
    title: 'Core',
    href: '/core',
    icon: Package,
  },
  {
    title: 'Tools',
    href: '/tools',
    icon: Wrench,
    subItems: [
      {
        title: 'Projects',
        href: '/tools/projects',
        icon: Hammer,
      },
      {
        title: 'Accounts',
        href: '/tools/accounts',
        icon: User,
      },
      {
        title: 'Users',
        href: '/tools/users',
        icon: Users,
      },
      {
        title: 'Types',
        href: '/tools/types',
        icon: Package,
      },
      {
        title: 'Staff Assignments',
        href: '/tools/staff-assignments',
        icon: UserCog,
      },
    ],
  },
];

const getAppItems = () => [
  {
    title: 'Admins',
    href: '/app/admins',
    icon: Shield,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut: authSignOut, currentProject } = useAuth();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const { data: isStaff, isLoading: isStaffLoading } = useIsStaff();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: isAccountOwner, isLoading: isAccountOwnerLoading } = useIsAccountOwner();

  useEffect(() => {
    // Get initial user
    authService.getUser().then(setLocalUser).catch(console.error);

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setLocalUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await authSignOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center px-2 py-1.5 text-lg font-semibold">
          Wondrous Digital
        </Link>
        <AccountDropdown />
        <ProjectDropdown />
        <Separator className="my-2" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getNavigationItems(currentProject).map((item) => (
                <SidebarMenuItemComponent key={item.href} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {!isAccountOwnerLoading && isAccountOwner && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>Account Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItemComponent 
                    item={{
                      title: 'Team Members',
                      href: '/account/users',
                      icon: Users,
                    }}
                  />
                  <SidebarMenuItemComponent 
                    item={{
                      title: 'Archived Projects',
                      href: '/account/archived',
                      icon: Archive,
                    }}
                  />
                  <SidebarMenuItemComponent 
                    item={{
                      title: 'Account Settings',
                      href: '/account',
                      icon: Briefcase,
                    }}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        
        {!isStaffLoading && isStaff && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>Staff</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItemComponent 
                    item={{
                      title: 'My Assignments',
                      href: '/staff/my-assignments',
                      icon: ClipboardList,
                    }}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getStaffItems().map((item) => (
                    <SidebarMenuItemComponent key={item.href} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        
        {!isAdminLoading && isAdmin && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>App</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getAppItems().map((item) => (
                    <SidebarMenuItemComponent key={item.href} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {user?.email ? getUserInitials(user.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start truncate">
                    <span className="text-sm font-medium">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {user?.email || 'Loading...'}
                    </span>
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
                <DropdownMenuItem asChild>
                  <Link href="/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
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
    </Sidebar>
  );
}