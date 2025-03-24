import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { resolve } from 'path';

// 🔧 Plugin to copy _headers and _redirects to dist/
const copyNetlifyFilesPlugin = () => {
  return {
    name: 'copy-netlify-files',
    closeBundle: () => {
      // Create headers and redirects content if files don't exist
      const headersContent = `/*
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https://res.cloudinary.com https://*.cloudinary.com https://*.googleapis.com https://*.gstatic.com https://maps.google.com; connect-src 'self' http://localhost:3000 https://res.cloudinary.com https://*.googleapis.com https://vandy-lost-and-found-2ff42902dec4.herokuapp.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;
`;

      const redirectsContent = `/* /index.html 200`;

      // Ensure dist directory exists
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist', { recursive: true });
      }

      // Write files directly to dist rather than copying
      try {
        fs.writeFileSync('dist/_headers', headersContent);
        console.log('✅ Created _headers in dist/');
      } catch (err) {
        console.error('❌ Failed to create _headers:', err);
      }

      try {
        fs.writeFileSync('dist/_redirects', redirectsContent);
        console.log('✅ Created _redirects in dist/');
      } catch (err) {
        console.error('❌ Failed to create _redirects:', err);
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
      // Add alias for components to help with relative path imports
      'components': path.resolve(__dirname, './src/components'),
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://res.cloudinary.com https://*.cloudinary.com https://*.googleapis.com https://*.gstatic.com https://maps.google.com; connect-src 'self' http://localhost:3000 https://res.cloudinary.com https://*.googleapis.com https://vandy-lost-and-found-2ff42902dec4.herokuapp.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
    }
  },
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
  }
});