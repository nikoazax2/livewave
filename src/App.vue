<template>
    <div :class="{ 'mobile': mobile }" class="app">
        <Welcome :language="language" v-if="firstVisit" :username="username" />
        <SetUser :language="language" v-if="askUsername" :username="username" @set-username="setUsername" />
        <router-view :mobile="mobile" @setLanguage="setLanguage" :language="language" :bots="bots" @setaskUsername="askUsername = $event" :username="username" />
    </div>
</template>

<script>
import username from './assets/usernames.json';
import Welcome from './components/Welcome.vue';
import SetUser from './components/SetUser.vue';

export default {
    name: 'App',
    components: {
        Welcome,
        SetUser
    },
    data() {
        return {
            username: null,
            askUsername: false,
            config: null,
            firstVisit: false,
            bots: false,
            settings: false,
            language: 'en',
            mobile: false
        };
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
        this.mobile = window.innerWidth < 600
    },
    methods: {
        getLanguage() {
            const lang = navigator.language || navigator.userLanguage;

            if (lang.startsWith('fr')) return 'fr';
            if (lang.startsWith('en')) return 'en';

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
html,
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.mobile {
    .chat-container,
    .wave-container,
    .wave-card,
    .chat-card {
        padding: 0 !important;
    }
}

a {
    color: inherit;
    text-decoration: none;
    font-weight: bold;
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