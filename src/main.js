import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import './styles/tailwind.css'
import './styles/theme.scss'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Components
import App from './App.vue'
import router from './router'; // Import du router
import Toast from 'vue-toastification';
import texts from './texts.json'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'livewave',
        themes: {
            livewave: {
                dark: true,
                colors: {
                    background: '#05060f',
                    surface: '#12142c',
                    primary: '#8b3dff',
                    secondary: '#4d7cff',
                    accent: '#ff3d8b',
                    error: '#ff4757',
                },
            },
        },
    },
})


const app = createApp(App)
app.config.globalProperties.$texts = texts
app.use(router).use(Toast, {
    position: 'top-right',
    timeout: 2000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: false,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
})
    .use(vuetify).mount('#app')
