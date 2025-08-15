'use client';

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
  Wrench,
  FileText,
  Shield,
  Archive,
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

import type { Project } from '@/types/database';

const getNavigationItems = (currentProject: Project | null) => [
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
      // {
      //   title: 'Staff Assignments',
      //   href: '/tools/staff-assignments',
      //   icon: UserCog,
      // },
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
  const router = useRouter();
  const { user, signOut: authSignOut, currentProject } = useAuth();
  const { data: isStaff, isLoading: isStaffLoading } = useIsStaff();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: isAccountOwner, isLoading: isAccountOwnerLoading } = useIsAccountOwner();
  const { data: userProfile } = useUserProfile();
  const { data: userRole } = useUserRole();


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
                  {/* <SidebarMenuItemComponent 
                    item={{
                      title: 'Account Settings',
                      href: '/account',
                      icon: Briefcase,
                    }}
                  /> */}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        
        {!isStaffLoading && isStaff && (
          <>
            {/* <SidebarGroup>
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
            </SidebarGroup> */}
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