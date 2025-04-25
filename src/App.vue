<template>
    <div :class="{ 'mobile': mobile }" class="app">
        <router-view />

        <!-- Bouton d'installation visible après 5 minutes -->
        <div v-if="showInstallPrompt" class="install-prompt">
            <p>Voulez-vous installer Livewave sur votre appareil ?</p>
            <v-btn @click="showInstallPrompt = false" color="secondary" class="mr-2">Annuler</v-btn>
            <v-btn @click="installApp" color="primary">Installer</v-btn>
            <!-- <button @click="showInstallPrompt = false">Annuler</button>
            <button @click="installApp">Installer</button> -->
        </div>
    </div>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
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
#app,
.app {
    height: 100%;
}

.install-prompt {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: #222;
    color: white;
    padding: 1rem;
    border-radius: 10px;
    text-align: center;
    z-index: 1000;
}
</style>