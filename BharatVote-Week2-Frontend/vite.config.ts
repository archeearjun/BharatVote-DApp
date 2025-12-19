import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      buffer: 'buffer',
    },
  },
  server: {
    port: 5174,  // Different port from Week 1 (5173)
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          polyfills: ['buffer']
        }
      }
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});

