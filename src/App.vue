<template>
    <div>
        <Welcome v-if="firstVisit" :username="username"></Welcome>
        <router-view :username="username"></router-view>
    </div>
</template>

<script>
import username from './assets/usernames.json';
import Welcome from './components/Welcome.vue';

export default {
    name: 'App',
    components: {
        Welcome
    },
    data() {
        return {
            username: null,
            askUsername: false,
            config: null,
            firstVisit: false
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
    },
    methods: {
        setUsername(username) {
            this.username = username
            this.askUsername = false
            localStorage.setItem('livewave-params', JSON.stringify({ username }))
        }
    }
};              
</script>

<style>
html,
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
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