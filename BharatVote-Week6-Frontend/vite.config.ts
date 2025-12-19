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
    port: 5176,  // Week 6 port (Week 1: 5173, Week 2: 5174, Week 3: 5175, Week 4: 5176, Week 5: 5176, Week 6: 5176)
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

