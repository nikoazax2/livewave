import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), VitePWA({
        registerType: 'autoUpdate',
        manifest: {
            name: 'Livewave',
            short_name: 'Livewave',
            description: 'Rejoignez la conversation en temps réel autour des événements qui vous passionnent !',
            theme_color: '#0d0d0d',
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            icons: [
                {
                    src: '/pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: '/pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
                {
                    src: '/pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable',
                }
            ]
        }
    })],
    build: {
        rollupOptions: {
            external: ['ws']
        }
    }
})
