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
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-stacks': ['@stacks/connect', '@stacks/transactions'],
          'vendor-react': ['react', 'react-dom'],
          'vendor-wallet': ['@reown/appkit', '@walletconnect/sign-client'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
    },
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
