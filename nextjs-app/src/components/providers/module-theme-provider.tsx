'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useModuleThemeStore } from '@/stores/module-theme-store';

export function ModuleThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Initialize theme on mount
  useEffect(() => {
    // Hydrate the persisted store
    useModuleThemeStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  // Apply theme once hydrated
  useEffect(() => {
    if (isHydrated) {
      const state = useModuleThemeStore.getState();
      state.loadPersistedModule();
      state.applyThemeToDOM();
    }
  }, [isHydrated]);

  // Auto-detect module when pathname changes
  useEffect(() => {
    if (isHydrated) {
      const state = useModuleThemeStore.getState();
      state.autoDetectModule();
    }
  }, [pathname, isHydrated]);

  return <>{children}</>;
}