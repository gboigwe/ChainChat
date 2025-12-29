import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend Vite configuration for ChainChat with React 19 optimizations
export default defineConfig({
  plugins: [
    react({
      // Enable React 19 compiler optimizations
      jsxRuntime: 'automatic',
      // Fast Refresh for React 19
      fastRefresh: true,
    }),
  ],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-stacks': ['@stacks/connect', '@stacks/transactions'],
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
});
