// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // This proxy is ONLY used during local development
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path
        }
      }
    },
    define: {
      // Expose environment variable at build time
      'process.env': {
        VITE_API_URL: process.env.VITE_API_URL
      }
    },
    build: {
      rollupOptions: {
        external: []
      }
    }
  };
});
