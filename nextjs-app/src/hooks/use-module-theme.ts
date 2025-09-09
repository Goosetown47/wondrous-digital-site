import { useModuleThemeStore } from '@/stores/module-theme-store';

export function useModuleTheme() {
  const {
    currentModule,
    setModule,
    getCurrentModuleColors,
    isAdminModule,
    hexToRgb,
    getColorWithOpacity,
  } = useModuleThemeStore();

  return {
    currentModule,
    setModule,
    colors: getCurrentModuleColors(),
    isAdmin: isAdminModule(),
    utils: {
      hexToRgb,
      getColorWithOpacity,
    },
  };
}

// Helper hook to get module-aware class names
// Most styling is now handled via CSS variables that shadcn components use
export function useModuleClasses() {
  const { currentModule } = useModuleThemeStore();
  
  return {
    // Module-specific boolean flags
    isDashboard: currentModule === 'dashboard',
    isBuilder: currentModule === 'builder',
    isAdmin: currentModule === 'admin',
  };
}