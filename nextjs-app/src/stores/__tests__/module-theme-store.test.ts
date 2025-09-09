import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModuleThemeStore } from '../module-theme-store';

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock;

describe('Module Theme Store', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset the store state
    useModuleThemeStore.setState({
      currentModule: 'dashboard',
      moduleColors: {
        dashboard: {
          primary: '#6B7280',
          secondary: '#9CA3AF',
          accent: '#EFEFEF',
          background: '#F9FAFB',
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
          accent: '#FCDFF2',
          background: '#FCEDFB',
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Switching', () => {
    it('should initialize with dashboard module', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      expect(result.current.currentModule).toBe('dashboard');
    });

    it('should switch to builder module', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      act(() => {
        result.current.setModule('builder');
      });

      expect(result.current.currentModule).toBe('builder');
    });

    it('should switch to admin module', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      act(() => {
        result.current.setModule('admin');
      });

      expect(result.current.currentModule).toBe('admin');
    });

    it('should get correct colors for current module', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      // Dashboard colors
      expect(result.current.getCurrentModuleColors()).toEqual({
        primary: '#6B7280',
        secondary: '#9CA3AF',
        accent: '#EFEFEF',
        background: '#F9FAFB',
      });

      // Switch to builder
      act(() => {
        result.current.setModule('builder');
      });

      expect(result.current.getCurrentModuleColors()).toEqual({
        primary: '#AA60C4',
        secondary: '#73248F',
        accent: '#EFD0FA',
        background: '#F4E0FC',
      });
    });
  });

  describe('Theme Persistence', () => {
    it('should save module selection to localStorage', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      act(() => {
        result.current.setModule('builder');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'module-theme',
        'builder'
      );
    });

    it('should load module selection from localStorage on init', () => {
      (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue('admin');
      
      const { result } = renderHook(() => useModuleThemeStore());
      
      act(() => {
        result.current.loadPersistedModule();
      });

      expect(result.current.currentModule).toBe('admin');
    });

    it('should handle invalid localStorage data gracefully', () => {
      (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid-module');
      
      const { result } = renderHook(() => useModuleThemeStore());
      
      act(() => {
        result.current.loadPersistedModule();
      });

      // Should remain dashboard (default)
      expect(result.current.currentModule).toBe('dashboard');
    });
  });

  describe('CSS Custom Properties', () => {
    it('should apply CSS custom properties when module changes', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      act(() => {
        result.current.applyThemeToDOM();
      });

      // Check that CSS properties are set
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--module-primary')).toBe('#6B7280');
      expect(root.style.getPropertyValue('--module-secondary')).toBe('#9CA3AF');
      expect(root.style.getPropertyValue('--module-accent')).toBe('#EFEFEF');
      expect(root.style.getPropertyValue('--module-background')).toBe('#F9FAFB');
    });

    it('should update CSS properties when switching modules', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      act(() => {
        result.current.setModule('builder');
        result.current.applyThemeToDOM();
      });

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--module-primary')).toBe('#AA60C4');
      expect(root.style.getPropertyValue('--module-secondary')).toBe('#73248F');
    });
  });

  describe('Module Detection', () => {
    it('should detect module from URL path', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      expect(result.current.getModuleFromPath('/dashboard')).toBe('dashboard');
      expect(result.current.getModuleFromPath('/dashboard/billing')).toBe('dashboard');
      expect(result.current.getModuleFromPath('/builder/project-123')).toBe('builder');
      expect(result.current.getModuleFromPath('/admin/lab')).toBe('admin');
      expect(result.current.getModuleFromPath('/unknown')).toBe('dashboard');
    });

    it('should auto-detect and apply module based on current path', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { pathname: '/builder/project-123/canvas' },
        writable: true,
      });

      const { result } = renderHook(() => useModuleThemeStore());
      
      act(() => {
        result.current.autoDetectModule();
      });

      expect(result.current.currentModule).toBe('builder');
    });
  });

  describe('Theme Utility Functions', () => {
    it('should provide hex to RGB conversion', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      expect(result.current.hexToRgb('#AA60C4')).toBe('170, 96, 196');
      expect(result.current.hexToRgb('#000000')).toBe('0, 0, 0');
      expect(result.current.hexToRgb('#FFFFFF')).toBe('255, 255, 255');
    });

    it('should provide color opacity utility', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      expect(result.current.getColorWithOpacity('#AA60C4', 0.5)).toBe('rgba(170, 96, 196, 0.5)');
      expect(result.current.getColorWithOpacity('#000000', 0.2)).toBe('rgba(0, 0, 0, 0.2)');
    });

    it('should check if current module is admin', () => {
      const { result } = renderHook(() => useModuleThemeStore());
      
      expect(result.current.isAdminModule()).toBe(false);
      
      act(() => {
        result.current.setModule('admin');
      });
      
      expect(result.current.isAdminModule()).toBe(true);
    });
  });
});