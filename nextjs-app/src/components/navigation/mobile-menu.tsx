'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { useAuth } from '@/providers/auth-provider';
import { useIsAdmin, useIsAccountOwner } from '@/hooks/useRole';
import { useRouter } from 'next/navigation';
import { NavigationSection } from './navigation-section';
import { NavigationMenuItem } from './navigation-menu-item';
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
  BookOpen,
  BarChart3,
  Globe,
  Plug,
  FlaskConical,
  Database,
  Hammer,
  Building,
  Package,
  ShieldCheck,
} from 'lucide-react';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { currentModule, setModule } = useModuleThemeStore();
  const { currentProject } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: isAccountOwner } = useIsAccountOwner();
  const router = useRouter();

  const handleModuleChange = (value: string) => {
    setModule(value as 'dashboard' | 'builder' | 'admin');
    router.push(`/${value}`);
  };

  // Dashboard navigation items
  const dashboardNavigation = (
    <>
      <NavigationSection title="Application">
        <NavigationMenuItem
          href="/dashboard"
          icon={LayoutGrid}
          label="Dashboard"
        />
        <NavigationMenuItem
          href="/dashboard/updates"
          icon={Bell}
          label="Updates"
        />
        <NavigationMenuItem
          href="/dashboard/tasks"
          icon={CheckSquare}
          label="Tasks"
        />
      </NavigationSection>

      <NavigationSection title="Project Management">
        <NavigationMenuItem
          href="/dashboard/archived-projects"
          icon={Archive}
          label="Archived Projects"
        />
      </NavigationSection>

      {isAccountOwner && (
        <NavigationSection title="Account Management">
          <NavigationMenuItem
            href="/dashboard/billing"
            icon={CreditCard}
            label="Billing"
          />
          <NavigationMenuItem
            href="/dashboard/account-settings"
            icon={Settings}
            label="Account Settings"
          />
          <NavigationMenuItem
            href="/dashboard/team-members"
            icon={Users}
            label="Team Members"
          />
        </NavigationSection>
      )}
    </>
  );

  // Builder navigation items
  const builderNavigation = currentProject && (
    <div className="space-y-1">
      <NavigationMenuItem
        href={`/builder/${currentProject.id}`}
        icon={LayoutGrid}
        label="Canvas"
      />
      <NavigationMenuItem
        href={`/builder/${currentProject.id}/pages`}
        icon={FileText}
        label="Pages"
      />
      <NavigationMenuItem
        href={`/builder/${currentProject.id}/navigation`}
        icon={Route}
        label="Navigation"
      />
      <NavigationMenuItem
        href={`/builder/${currentProject.id}/themes`}
        icon={Palette}
        label="Themes"
      />
      <NavigationMenuItem
        href={`/builder/${currentProject.id}/templates`}
        icon={FileCode}
        label="Templates"
      />
      <NavigationMenuItem
        href={`/builder/${currentProject.id}/blog`}
        icon={BookOpen}
        label="Blog"
      />
      <NavigationMenuItem
        href={`/builder/${currentProject.id}/traffic`}
        icon={BarChart3}
        label="Traffic"
      />
      <NavigationMenuItem
        href={`/builder/${currentProject.id}/settings`}
        icon={Settings}
        label="Settings"
      />
      <NavigationMenuItem
        href={`/builder/${currentProject.id}/domains`}
        icon={Globe}
        label="Domains"
      />
      <NavigationMenuItem
        href={`/builder/${currentProject.id}/integrations`}
        icon={Plug}
        label="Integrations"
      />
    </div>
  );

  // Admin navigation items
  const adminNavigation = isAdmin && (
    <>
      <NavigationSection title="Lab">
        <NavigationMenuItem
          href="/admin/lab"
          icon={FlaskConical}
          label="Drafts"
        />
        <NavigationMenuItem
          href="/admin/lab/themes"
          icon={Palette}
          label="Theme Builder"
        />
      </NavigationSection>

      <NavigationSection title="Library">
        <NavigationMenuItem
          href="/admin/library/sites"
          icon={Globe}
          label="Sites"
        />
        <NavigationMenuItem
          href="/admin/library/pages"
          icon={FileText}
          label="Pages"
        />
        <NavigationMenuItem
          href="/admin/library/sections"
          icon={Package}
          label="Sections"
        />
        <NavigationMenuItem
          href="/admin/library/themes"
          icon={Palette}
          label="Themes"
        />
      </NavigationSection>

      <div className="space-y-1">
        <NavigationMenuItem
          href="/admin/core"
          icon={Database}
          label="Core"
        />
        <NavigationMenuItem
          href="/admin/projects"
          icon={Hammer}
          label="Projects"
        />
        <NavigationMenuItem
          href="/admin/accounts"
          icon={Building}
          label="Accounts"
        />
        <NavigationMenuItem
          href="/admin/users"
          icon={Users}
          label="Users"
        />
        <NavigationMenuItem
          href="/admin/types"
          icon={Package}
          label="Types"
        />
        <NavigationMenuItem
          href="/admin/administrators"
          icon={ShieldCheck}
          label="Administrators"
        />
      </div>
    </>
  );

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] bg-[#EFEFEF] p-0">
          {/* Hidden title for accessibility */}
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          
          <div className="flex h-full flex-col">
            {/* Module Selector Dropdown - Added margin-top to avoid overlap with close button */}
            <div className="px-6 pt-12 pb-4 border-b border-gray-200">
              <Select value={currentModule} onValueChange={handleModuleChange}>
                <SelectTrigger className="w-full bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="builder">Builder</SelectItem>
                  {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <nav className="space-y-6">
                {currentModule === 'dashboard' && dashboardNavigation}
                {currentModule === 'builder' && builderNavigation}
                {currentModule === 'admin' && adminNavigation}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}