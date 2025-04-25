<template>
    <div :class="{ 'mobile': mobile }" class="app">
        <router-view />
    </div>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
            mobile: false,
        };
    },
    created() {
        this.mobile = window.innerWidth < 600

        let deferredPrompt = null

        const installApp = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt()
                const result = await deferredPrompt.userChoice
                if (result.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt')
                } else {
                    console.log('User dismissed the A2HS prompt')
                }
                showInstallPrompt.value = false
                deferredPrompt = null
            }
        }
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            deferredPrompt = e

            // Délai de 5 minutes avant d’afficher ton UI personnalisée
            setTimeout(() => {
                installApp()
            }, 10000)
        })
    },
    methods: {

    }
};              
</script>

<style lang="scss">
#app,
.app {
    height: 100%;
}

::-webkit-scrollbar {
    width: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
}
</style>