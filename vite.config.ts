import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://api:4000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'CONTROL DE GASTOS',
        short_name: 'CDG',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: '/icon-192x192.png',
            type: 'image/png',
            sizes: '192x192'
          },
          {
            src: '/icon-512x512.png',
            type: 'image/png',
            sizes: '512x512'
          }
        ]
      },
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ['document', 'script', 'style', 'image', 'font'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          }
        ]
      }
    })
  ]
});
