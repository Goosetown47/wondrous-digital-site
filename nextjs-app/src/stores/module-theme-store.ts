import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModuleType = 'dashboard' | 'builder' | 'admin';

export interface ModuleColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

interface ModuleThemeState {
  currentModule: ModuleType;
  moduleColors: Record<ModuleType, ModuleColors>;
  setModule: (module: ModuleType) => void;
  getCurrentModuleColors: () => ModuleColors;
  applyThemeToDOM: () => void;
  loadPersistedModule: () => void;
  getModuleFromPath: (path: string) => ModuleType;
  autoDetectModule: () => void;
  hexToRgb: (hex: string) => string;
  hexToHSL: (hex: string) => string;
  getColorWithOpacity: (hex: string, opacity: number) => string;
  isAdminModule: () => boolean;
}

const moduleThemeStore: StateCreator<ModuleThemeState> = (set, get) => ({
      currentModule: 'dashboard',
      moduleColors: {
        dashboard: {
          primary: '#404040',  // Updated from #6B7280
          secondary: '#818181', 
          accent: '#F8F8F6',   // Active background
          background: '#EFEFEF',
        },
        builder: {
          primary: '#AA60C4',
          secondary: '#73248F',
          accent: '#EFD0FA',
          background: '#F4E0FC',
        },
        admin: {
          primary: '#E382A5',
          secondary: '#B5406B',
          accent: '#EFEFEF',   // Updated to match design
          background: '#EFEFEF', // Updated to match design
        },
      },

      setModule: (module: ModuleType) => {
        set({ currentModule: module });
        get().applyThemeToDOM();
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('module-theme', module);
        }
      },

      getCurrentModuleColors: () => {
        const state = get();
        return state.moduleColors[state.currentModule];
      },

      applyThemeToDOM: () => {
        if (typeof document === 'undefined') return;
        
        const colors = get().getCurrentModuleColors();
        const root = document.documentElement;
        const hexToHSL = get().hexToHSL;
        
        // Set shadcn CSS variables using their convention
        // Primary button: module primary color with white text
        root.style.setProperty('--primary', hexToHSL(colors.primary));
        root.style.setProperty('--primary-foreground', '0 0% 100%'); // white
        
        // Secondary button: module accent background with secondary text
        root.style.setProperty('--secondary', hexToHSL(colors.accent));
        root.style.setProperty('--secondary-foreground', hexToHSL(colors.secondary));
        
        // Accent (used for hover states)
        root.style.setProperty('--accent', hexToHSL(colors.accent));
        root.style.setProperty('--accent-foreground', hexToHSL(colors.secondary));
        
        // Muted (used for tertiary/ghost buttons)
        root.style.setProperty('--muted', hexToHSL(colors.background));
        root.style.setProperty('--muted-foreground', '0 0% 20%'); // dark gray
        
        // NOTE: We're NOT setting --border or --input 
        // These remain as the default grey for the monochrome app shell
        // Only buttons and badges get module colors
        
        // Keep our custom module variables for other uses
        root.style.setProperty('--module-primary', colors.primary);
        root.style.setProperty('--module-secondary', colors.secondary);
        root.style.setProperty('--module-accent', colors.accent);
        root.style.setProperty('--module-background', colors.background);
      },

      loadPersistedModule: () => {
        if (typeof window === 'undefined') return;
        
        const savedModule = localStorage.getItem('module-theme') as ModuleType | null;
        const validModules: ModuleType[] = ['dashboard', 'builder', 'admin'];
        
        if (savedModule && validModules.includes(savedModule)) {
          set({ currentModule: savedModule });
          get().applyThemeToDOM();
        }
      },

      getModuleFromPath: (path: string) => {
        if (path.startsWith('/dashboard')) return 'dashboard';
        if (path.startsWith('/builder')) return 'builder';
        // Admin module includes multiple paths
        if (path.startsWith('/admin') || 
            path.startsWith('/lab') || 
            path.startsWith('/library') || 
            path.startsWith('/core') || 
            path.startsWith('/tools') ||
            path.startsWith('/app/admins')) {
          return 'admin';
        }
        return 'dashboard'; // Default fallback
      },

      autoDetectModule: () => {
        if (typeof window === 'undefined') return;
        
        const module = get().getModuleFromPath(window.location.pathname);
        set({ currentModule: module });
        get().applyThemeToDOM();
      },

      hexToRgb: (hex: string) => {
        // Remove # if present
        const cleanHex = hex.replace('#', '');
        
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
      },

      hexToHSL: (hex: string) => {
        // Remove # if present
        const cleanHex = hex.replace('#', '');
        
        // Convert hex to RGB
        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const sum = max + min;
        const l = sum / 2;
        
        let h, s;
        
        if (diff === 0) {
          h = s = 0; // achromatic
        } else {
          s = l > 0.5 ? diff / (2 - sum) : diff / sum;
          
          switch (max) {
            case r:
              h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
              break;
            case g:
              h = ((b - r) / diff + 2) / 6;
              break;
            case b:
              h = ((r - g) / diff + 4) / 6;
              break;
            default:
              h = 0;
          }
        }
        
        // Convert to shadcn format: "hue saturation% lightness%"
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      },

      getColorWithOpacity: (hex: string, opacity: number) => {
        const rgb = get().hexToRgb(hex);
        return `rgba(${rgb}, ${opacity})`;
      },

      isAdminModule: () => {
        return get().currentModule === 'admin';
      },
});

export const useModuleThemeStore = create<ModuleThemeState>()(
  persist(
    moduleThemeStore,
    {
      name: 'module-theme-storage',
      skipHydration: true,
    }
  )
);