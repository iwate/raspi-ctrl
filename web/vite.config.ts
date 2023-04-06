import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: [],
      manifest: {
        theme_color: '#ffffff',
        background_color: '#4a90e2',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        short_name: 'raspi ctrl',
        description: 'controll raspo via web.',
        name: 'raspi ctrl',
        icons: [],
        orientation: 'landscape',
      },
    }),
  ],
})
