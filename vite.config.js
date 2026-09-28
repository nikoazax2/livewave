import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vuetify({ autoImport: false, styles: { configFile: 'src/styles/vuetify-settings.scss' } }), tailwindcss(), AutoImport({
        imports: ['vue', '@vueuse/core'],
        include: [/components[\/]inspira[\/].*\.(vue|ts)$/],
        dts: false,
    }), VitePWA({
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
