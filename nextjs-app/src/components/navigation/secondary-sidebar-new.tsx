'use client';

import React from 'react';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { useAuth } from '@/providers/auth-provider';
import { useIsAdmin, useIsAccountOwner } from '@/hooks/useRole';
import { cn } from '@/lib/utils';
import { AccountProjectSelector } from './account-project-selector';
import { NavigationSection } from './navigation-section';
import { NavigationMenuItem } from './navigation-menu-item';

// Import all the icons we need
import {
  LayoutGrid,
  Bell,
  CheckSquare,
  Archive,
  CreditCard,
  Settings,
  Users,
  FileText,
  Route,
  Palette,
  FileCode,
  PenTool,
  TrendingUp,
  Globe,
  Zap,
  FlaskConical,
  Hammer,
  Package,
  Sparkles,
  Brush,
  Layers,
  UserRound,
} from 'lucide-react';

interface SecondarySidebarProps {
  isCollapsed?: boolean;
}

export function SecondarySidebar({ isCollapsed = false }: SecondarySidebarProps) {

  const { currentModule } = useModuleThemeStore();
  const { currentProject } = useAuth();
  useIsAdmin(); // Check admin status
  const { data: isAccountOwner, isLoading: isAccountOwnerLoading } = useIsAccountOwner();

  // Dashboard navigation items
  const dashboardNavigation = (
    <>
      <NavigationSection title="Application" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href="/dashboard"
          icon={LayoutGrid}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href="/dashboard/updates"
          icon={Bell}
          label="Updates"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href="/dashboard/tasks"
          icon={CheckSquare}
          label="Tasks"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>

      <NavigationSection title="Project Management" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href="/dashboard/archived-projects"
          icon={Archive}
          label="Archived Projects"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>

      {!isAccountOwnerLoading && isAccountOwner && (
        <NavigationSection title="Account Management" isCollapsed={isCollapsed}>
          <NavigationMenuItem
            href="/dashboard/billing"
            icon={CreditCard}
            label="Billing"
            isCollapsed={isCollapsed}
          />
          <NavigationMenuItem
            href="/dashboard/account-settings"
            icon={Settings}
            label="Account Settings"
            isCollapsed={isCollapsed}
          />
          <NavigationMenuItem
            href="/dashboard/team-members"
            icon={Users}
            label="Team Members"
            isCollapsed={isCollapsed}
          />
        </NavigationSection>
      )}
    </>
  );

  // Builder navigation items
  const builderNavigation = currentProject && (
    <>
      <NavigationSection title="Tools" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href={`/builder/${currentProject.id}`}
          icon={LayoutGrid}
          label="Canvas"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href={`/builder/${currentProject.id}/pages`}
          icon={FileText}
          label="Pages"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href={`/builder/${currentProject.id}/navigation`}
          icon={Route}
          label="Navigation"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href={`/builder/${currentProject.id}/themes`}
          icon={Palette}
          label="Themes"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href={`/builder/${currentProject.id}/templates`}
          icon={FileCode}
          label="Templates"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>

      <NavigationSection title="Content" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href={`/builder/${currentProject.id}/blog`}
          icon={PenTool}
          label="Blog"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>

      <NavigationSection title="Metrics" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href={`/builder/${currentProject.id}/traffic`}
          icon={TrendingUp}
          label="Traffic"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>

      <NavigationSection title="Project Management" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href={`/builder/${currentProject.id}/settings`}
          icon={Settings}
          label="Settings"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href={`/builder/${currentProject.id}/domains`}
          icon={Globe}
          label="Domains"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href={`/builder/${currentProject.id}/integrations`}
          icon={Zap}
          label="Smart Integrations"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>
    </>
  );

  // Admin navigation items
  const adminNavigation = (
    <>
      <NavigationSection title="Lab" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href="/admin/lab"
          icon={FlaskConical}
          label="Drafts"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href="/admin/lab/themes"
          icon={Palette}
          label="Theme Builder"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>

      <NavigationSection title="Library" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href="/admin/library/sites"
          icon={Globe}
          label="Sites"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href="/admin/library/pages"
          icon={FileText}
          label="Pages"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href="/admin/library/sections"
          icon={Layers}
          label="Sections"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href="/admin/library/themes"
          icon={Brush}
          label="Themes"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>

      <NavigationSection title="Components" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href="/admin/core"
          icon={Sparkles}
          label="Core"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>

      <NavigationSection title="Tools" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href="/admin/projects"
          icon={Hammer}
          label="Projects"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href="/admin/accounts"
          icon={UserRound}
          label="Accounts"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href="/admin/users"
          icon={Users}
          label="Users"
          isCollapsed={isCollapsed}
        />
        <NavigationMenuItem
          href="/admin/types"
          icon={Package}
          label="Types"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>

      <div className="border-t border-gray-300 my-4" />

      <NavigationSection title="Admin Management" isCollapsed={isCollapsed}>
        <NavigationMenuItem
          href="/admin/administrators"
          icon={Users}
          label="Administrators"
          isCollapsed={isCollapsed}
        />
      </NavigationSection>
    </>
  );

  return (
    <div
      className={cn(
        'relative h-screen bg-[#EFEFEF] flex flex-col transition-all duration-300 ease-in-out overflow-hidden',
        isCollapsed ? 'w-0' : 'w-[300px]'
      )}
    >

      {/* Account/Project Selector */}
      <AccountProjectSelector isCollapsed={isCollapsed} />

      {/* Primary Module Heading */}
      {!isCollapsed && (
        <div className="px-6 py-4">
          <h1 className={cn(
            "text-2xl font-bold",
            currentModule === 'dashboard' && "text-[#404040]",
            currentModule === 'builder' && "text-[#AA60C4]",
            currentModule === 'admin' && "text-[#E382A5]"
          )}>
            {currentModule === 'dashboard' && 'Dashboard'}
            {currentModule === 'builder' && 'Builder'}
            {currentModule === 'admin' && 'Admin'}
          </h1>
        </div>
      )}

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto relative">
        
        <nav className={cn(
          'space-y-6',
          isCollapsed ? 'px-2' : 'px-6'
        )}>
          {currentModule === 'dashboard' && dashboardNavigation}
          {currentModule === 'builder' && builderNavigation}
          {currentModule === 'admin' && adminNavigation}
        </nav>
      </div>
    </div>
  );
}