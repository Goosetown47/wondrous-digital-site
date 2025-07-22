'use client';

import React from 'react';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { SiteStylesProvider } from '@/contexts/SiteStylesContext';
import { SiteStyles } from '@/lib/supabase';
import '@/styles/globals.css';
import '@/styles/section-typography.css';

interface ClientWrapperProps {
  siteStyles: SiteStyles | null;
  children: React.ReactNode;
}

export default function ClientWrapper({ siteStyles, children }: ClientWrapperProps) {
  return (
    <EditModeProvider initialMode={false}>
      <SiteStylesProvider siteStyles={siteStyles}>
        {children}
      </SiteStylesProvider>
    </EditModeProvider>
  );
}