'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useModuleThemeStore } from '@/stores/module-theme-store';

interface NavigationMenuItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed?: boolean;
  level?: 'primary' | 'secondary';
}

export function NavigationMenuItem({
  href,
  icon: Icon,
  label,
  isCollapsed = false,
  level = 'primary',
}: NavigationMenuItemProps) {
  const pathname = usePathname();
  const { currentModule } = useModuleThemeStore();
  
  // Known Builder routes that are NOT the canvas
  const knownBuilderRoutes = ['pages', 'navigation', 'themes', 'templates', 'blog', 'traffic', 'settings', 'domains', 'integrations'];
  
  // Check if this is the Canvas href (e.g., /builder/project-123)
  const isCanvasHref = href?.match(/^\/builder\/[^/]+$/) && !href.includes('/pages');
  
  // Check if we're on a known Builder route (not the canvas)
  const pathSegments = pathname?.split('/');
  const lastSegment = pathSegments?.[3]; // e.g., 'navigation' from /builder/project-123/navigation
  const isOnKnownRoute = lastSegment && knownBuilderRoutes.includes(lastSegment);
  
  // Check if this is a module root path (e.g., /dashboard)
  const isModuleRoot = href === '/dashboard' || href === '/admin';
  
  // Handle special admin path mappings
  // /admin/lab -> /lab, /admin/library/* -> /library, etc.
  const getActualPath = (navHref: string): string => {
    if (navHref === '/admin/lab') return '/lab';
    if (navHref === '/admin/lab/themes') return '/lab/themes';
    if (navHref.startsWith('/admin/library/')) return navHref.replace('/admin/library/', '/library/');
    if (navHref === '/admin/core') return '/core';
    // Tools pages map to /tools/*
    if (navHref === '/admin/projects') return '/tools/projects';
    if (navHref === '/admin/accounts') return '/tools/accounts';
    if (navHref === '/admin/users') return '/tools/users';
    if (navHref === '/admin/types') return '/tools/types';
    if (navHref === '/admin/administrators') return '/app/admins';
    return navHref;
  };
  
  // Determine if this item should be active
  let isActive = false;
  const actualPath = getActualPath(href);
  
  if (isCanvasHref) {
    // Canvas is active only when we're in Builder but NOT on a known route
    // This means we're on /builder/[projectId]/[pageId] where pageId is a UUID
    isActive = pathname?.startsWith(href + '/') && !isOnKnownRoute;
  } else if (isModuleRoot) {
    // Module roots only match exact paths
    isActive = pathname === href;
  } else if (href === '/admin/lab') {
    // Special case for Drafts - should not match /lab/themes
    isActive = pathname === '/lab' || (pathname?.startsWith('/lab/') && !pathname.startsWith('/lab/themes'));
  } else {
    // Check both the nav href and the actual path it maps to
    isActive = pathname === href || pathname?.startsWith(`${href}/`) ||
               pathname === actualPath || pathname?.startsWith(`${actualPath}/`);
  }

  // Get module colors - only for icons
  const getIconColor = () => {
    if (currentModule === 'builder') return 'text-[#AA60C4]';
    if (currentModule === 'admin') return 'text-[#E382A5]';
    return 'text-[#404040]'; // Dashboard default
  };

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
        'hover:bg-[#F8F8F6]',
        isActive && 'bg-[#F8F8F6]',
        level === 'secondary' && 'ml-6 text-sm',
        isCollapsed && 'justify-center px-2'
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={cn(
        'flex-shrink-0',
        level === 'primary' ? 'w-5 h-5' : 'w-4 h-4',
        getIconColor()
      )} />
      {!isCollapsed && (
        <span className={cn(
          'truncate text-sm font-semibold text-[#404040]'
        )}>
          {label}
        </span>
      )}
    </Link>
  );
}