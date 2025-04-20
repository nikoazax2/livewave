<template>
    <div :class="{ 'mobile': mobile }" class="appwaveschats" :style="getBackgroundImage()">
        <SetUser :language="language" v-if="askUsername" :username="username" @set-username="setUsername" />

        <WavesView :language="language" v-if="$route.path === '/'" :themeDark="themeDark" :mobile="mobile" @setLanguage="setLanguage" :bots="bots" @setaskUsername="askUsername = $event" :username="username" />

        <ChatView v-if="$route.path.includes('/chat')" :backgroundImage="backgroundImage" @backgroundImage="backgroundImage = $event" :language="language" :themeDark="themeDark" :mobile="mobile" :bots="bots" @setLanguage="setLanguage" :username="username" />

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

export default {
    name: 'App',
    components: {
        Welcome,
        SetUser,
        WavesView,
        ChatView,
        TopsMessages
    },
    data() {
        return {
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
        getBackgroundImage() {
            let background = ''
            if (this.backgroundImage) {
                background = `background: url(${this.backgroundImage}) center center fixed; background-size: cover!important;`;
            } else {
                background = `background: url('/backgroundchat${this.themeDark ? '' : 'white'}.png') center center fixed;  `;
            }
            return background;
        },
        setthemeDark(theme) {
            this.themeDark = theme
            localStorage.setItem('livewave-theme', JSON.stringify({ themeDark: this.themeDark }))
        },
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
.mobile{
    .card-container{
        padding: 0;
        min-width: 0!important;
        width: 100%!important;
    }
    .appwaveschats{
        width: 100%;
    }
}

.card-container {
    min-width: 600px;
    height: 100% !important;
    width: fit-content !important;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden !important;
    margin: 0 !important;
    max-width: none !important;
    // background: url('../assets/backgroundchat.png') center center fixed;
    background-size: 700px 700px !important;
}

.card-in {
    min-width: 300px;
    max-width: 600px;
    width: 100%;
    height: 100%;
    display: flex;
    border-radius: 10px;
    background-color: rgba(46, 49, 50, 0.5);
    padding: 10px 10px 0 10px;
    flex-direction: column;
    color: white;
}

html,
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100% !important;
}

.appwaveschats {
    height: 100% !important;
    background-size: 700px 700px !important;
    display: flex;
    justify-content: center;
}

.mobile {

    .chat-container,
    .wave-container,
    .wave-card,
    .chat-card {
        height: 100% !important;
        padding: 0 !important;
        border-radius: 0 !important;
    }
}

.wave-container,
.chat-container {
    padding: 16px;
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