/// <reference types="react" />
/// <reference types="react-dom" />

// Extend Window interface for global drag state
declare global {
  interface Window {
    __draggingItemId?: string;
  }
}

export {};