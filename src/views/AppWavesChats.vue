<template>
    <div :class="{ 'mobile': mobile }" class="appwaveschats">
        <ContactDialog v-if="contact" @close="contact = false" :language="language" @setContact="contact = $event"  />

        <SetUser :language="language" v-if="askUsername" :username="username" @set-username="setUsername"  />

        <WavesView :language="language" v-if="$route.path === '/'" :themeDark="themeDark" :mobile="mobile" @setLanguage="setLanguage" :bots="bots" @setaskUsername="askUsername = $event" :username="username" @setContact="contact = $event" />

        <ChatView v-if="$route.path.includes('/chat')" :backgroundImage="backgroundImage" @backgroundImage="backgroundImage = $event" :language="language" :themeDark="themeDark" :mobile="mobile" 
       @setContact="contact = $event"   :bots="bots" @setLanguage="setLanguage" :username="username" @setaskUsername="askUsername = $event" />

        <!-- <TopsMessages :language="language" :themeDark="themeDark" :mobile="mobile" :bots="bots" @setLanguage="setLanguage" :username="username" /> -->
    </div>
</template>

<script>
import username from '../assets/usernames.json';
import Welcome from '../components/Welcome.vue';
import SetUser from '../components/SetUser.vue';
import ChatView from './ChatView.vue';
import WavesView from './WavesView.vue';
import TopsMessages from '../components/TopsMessages.vue';
import ContactDialog from '../components/ContactDialog.vue';
import { background } from '../background';

export default {
    name: 'App',
    components: {
        Welcome,
        SetUser,
        WavesView,
        ChatView,
        TopsMessages,
        ContactDialog
    },
    data() {
        return {
            contact: false,
            username: null,
            askUsername: false,
            config: null,
            firstVisit: false,
            bots: true,
            settings: false,
            language: 'en',
            mobile: false,
            themeDark: false,
            backgroundImage: null,
        };
    },
    watch: {
        backgroundImage: {
            immediate: true,
            handler(image) {
                background.image = image;
            }
        }
    },
    unmounted() {
        background.image = null;
    },
    created() {
        this.config = localStorage.getItem('livewave-params')
        if (this.config) {
            this.config = JSON.parse(this.config)
            this.username = this.config.username
        } else {
            this.firstVisit = true
            if (!this.username) {
                let usernames = username
                let randomIndex = Math.floor(Math.random() * usernames.length)
                this.username = usernames[randomIndex] + Math.floor(Math.random() * 100)
                localStorage.setItem('livewave-params', JSON.stringify({ username: this.username }))
            }
        }
        this.language = this.getLanguage()
        this.themeDark = localStorage.getItem('livewave-theme')?.themeDark || false
        this.mobile = window.innerWidth < 600
    },
    methods: {
        setthemeDark(theme) {
            this.themeDark = theme
            localStorage.setItem('livewave-theme', JSON.stringify({ themeDark: this.themeDark }))
        },
        getLanguage() {
            const lang = navigator.language || navigator.userLanguage;

            if (lang.startsWith('fr')) return 'fr';
            if (lang.startsWith('en')) return 'en';
            if (lang.startsWith('es')) return 'es';
            if (lang.startsWith('de')) return 'de';

            return 'en'; // default fallback 
        },
        setLanguage(language) {
            this.language = language
        },
        setUsername(username) {
            this.username = username
            this.askUsername = false
            localStorage.setItem('livewave-params', JSON.stringify({ username }))
            this.settings = false
        }
    }
};              
</script>

<style lang="scss">
.appwaveschats {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
