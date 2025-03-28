import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import fs from 'fs';
import path from 'path';

// Read sitemap content
const sitemap = fs.readFileSync(path.resolve(__dirname, 'public/sitemap.xml'), 'utf-8');

export default defineConfig({
  plugins: [
    react({
      // Exclude sitemap.xml from React routing
      exclude: ['**/sitemap.xml']
    }),
    visualizer()
  ],
  build: {
    rollupOptions: {
      output: {
        // Add cache busting to file names
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          utils: ['axios', 'zustand']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    cssMinify: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000
  },
  server: {
    headers: {
      'Cache-Control': 'no-store',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    middlewares: [
      {
        name: 'serve-sitemap',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/sitemap.xml') {
              res.setHeader('Content-Type', 'application/xml');
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.end(sitemap);
            } else {
              next();
            }
          });
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  }
});