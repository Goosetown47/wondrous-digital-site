'use client';

import { useEffect, useState } from 'react';
import { useModuleThemeStore } from '@/stores/module-theme-store';

// Client-safe version of useModuleTheme that handles hydration
export function useModuleThemeClient() {
  const [isClient, setIsClient] = useState(false);
  const store = useModuleThemeStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return safe defaults during SSR
  if (!isClient) {
    return {
      currentModule: 'dashboard' as const,
      setModule: () => {},
      colors: {
        primary: '#6B7280',
        secondary: '#9CA3AF',
        accent: '#EFEFEF',
        background: '#F9FAFB',
      },
      isAdmin: false,
      isClient: false,
      utils: {
        hexToRgb: () => '0, 0, 0',
        getColorWithOpacity: () => 'rgba(0, 0, 0, 0)',
      },
    };
  }

  return {
    currentModule: store.currentModule,
    setModule: store.setModule,
    colors: store.getCurrentModuleColors(),
    isAdmin: store.isAdminModule(),
    isClient: true,
    utils: {
      hexToRgb: store.hexToRgb,
      getColorWithOpacity: store.getColorWithOpacity,
    },
  };
}