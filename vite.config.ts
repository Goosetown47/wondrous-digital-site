import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      supported: { 
        'top-level-await': true 
      },
    },
    include: [
      '@editorjs/editorjs',
      '@editorjs/header',
      '@editorjs/paragraph',
      '@editorjs/nested-list',
      '@editorjs/checklist',
      '@editorjs/quote',
      '@editorjs/code',
      '@editorjs/table',
      '@editorjs/link',
      '@editorjs/image',
      '@editorjs/delimiter',
      '@editorjs/marker',
      '@editorjs/underline',
      'uuid'
    ],
    exclude: ['lucide-react']
  },
});