<template>
    <div :class="{ 'mobile': mobile }" class="app">
        <WaveBackground :image="background.image" />
        <div class="app-content">
            <router-view />
        </div>
        <!-- Bouton d'installation visible après 5 minutes -->
        <div v-if="showInstallPrompt" class="install-prompt glass">
            <p>Voulez-vous installer Livewave sur votre appareil ?</p>
            <div class="install-actions">
                <button class="icon-btn install-cancel" @click="showInstallPrompt = false">Annuler</button>
                <button class="btn-gradient" @click="installApp">Installer</button>
            </div>
        </div>
    </div>
</template>

<script>
import WaveBackground from './components/WaveBackground.vue';
import { background } from './background';

export default {
    name: 'App',
    components: { WaveBackground },
    data() {
        return {
            background,
            mobile: false,
            deferredPrompt: null,
            showInstallPrompt: false, // Pour afficher le bouton d'installation
        };
    },
    created() {
        this.mobile = window.innerWidth < 600;

        // Attendre que l'événement 'beforeinstallprompt' soit déclenché
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault(); // Empêche le navigateur de montrer le prompt par défaut
            this.deferredPrompt = e;

            // Afficher le bouton d'installation après 5 minutes
            setTimeout(() => {
                this.showInstallPrompt = true;
            }, 300000); // 5 minutes en millisecondes
        });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                const height = window.visualViewport.height;
                document.body.style.paddingBottom = `${window.innerHeight - height}px`;
            });
        }

    },
    methods: {
        async installApp() {
            if (this.deferredPrompt) {
                // Affiche le prompt en réponse au clic de l'utilisateur
                this.deferredPrompt.prompt();
                const result = await this.deferredPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    console.log('L\'utilisateur a accepté l\'invite d\'installation');
                } else {
                    console.log('L\'utilisateur a rejeté l\'invite d\'installation');
                }
                this.showInstallPrompt = false; // Masque le bouton d'installation après l'acceptation ou le rejet
                this.deferredPrompt = null;
            }
        },
    },
};
</script>

<style lang="scss">
.app-content {
    position: relative;
    z-index: 1;
    height: 100%;
}

.install-prompt {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: min(440px, calc(100% - 32px));
    padding: 18px 20px;
    border-radius: var(--lw-radius);
    text-align: center;
    z-index: 1000;
    animation: lw-rise 0.5s ease both;

    p {
        margin: 0 0 14px;
    }

    .install-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .install-cancel {
        width: auto;
        padding: 0 18px;
        border-radius: 999px;
    }
}
</style>