'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

interface MenuItemProps {
  item: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    subItems?: Array<{
      title: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    }>;
  };
}

export function SidebarMenuItemComponent({ item }: MenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(item.href);
  const [isOpen, setIsOpen] = useState(isActive);

  if (item.subItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="pr-2.5">
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
              <ChevronRight
                className={cn(
                  "ml-auto h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-90"
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === subItem.href}
                  >
                    <Link href={subItem.href}>
                      <subItem.icon className="h-4 w-4" />
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}