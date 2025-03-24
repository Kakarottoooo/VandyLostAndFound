import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

// 🔧 Plugin to copy _headers and _redirects to dist/
const copyNetlifyFilesPlugin = () => {
  return {
    name: 'copy-netlify-files',
    closeBundle: () => {
      const headersFrom = resolve(__dirname, 'public/_headers');
      const headersTo = resolve(__dirname, 'dist/_headers');
      const redirectsFrom = resolve(__dirname, 'public/_redirects');
      const redirectsTo = resolve(__dirname, 'dist/_redirects');

      try {
        copyFileSync(headersFrom, headersTo);
        console.log('✅ Copied _headers to dist/');
      } catch (err) {
        console.error('❌ Failed to copy _headers:', err);
      }

      try {
        copyFileSync(redirectsFrom, redirectsTo);
        console.log('✅ Copied _redirects to dist/');
      } catch (err) {
        console.error('❌ Failed to copy _redirects:', err);
      }
    },
  };
};

// CSP plugin to ensure headers are properly set
const cspPlugin = () => {
  return {
    name: 'vite-plugin-csp',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; img-src 'self' data: https://res.cloudinary.com https://*.cloudinary.com https://*.googleapis.com https://*.gstatic.com https://maps.google.com; connect-src 'self' http://localhost:3000 https://res.cloudinary.com https://*.googleapis.com https://vandy-lost-and-found-2ff42902dec4.herokuapp.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
        );
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), copyNetlifyFilesPlugin(), cspPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://res.cloudinary.com https://*.cloudinary.com https://*.googleapis.com https://*.gstatic.com https://maps.google.com; connect-src 'self' http://localhost:3000 https://res.cloudinary.com https://*.googleapis.com https://vandy-lost-and-found-2ff42902dec4.herokuapp.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
    }
  }
});