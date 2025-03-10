<template>
    <div>
        <!-- <SetUser @set-username="setUsername" v-if="askUsername" /> -->
        <router-view :username="username" :chatId="$route.params.id"></router-view>
    </div>
</template>

<script>
import SetUser from './components/SetUser.vue';
import username from './assets/usernames.json';
export default {
    name: 'App',
    components: {
        SetUser
    },
    data() {
        return {
            username: null,
            askUsername: false,
            config: null
        };
    },
    created() {
        this.config = localStorage.getItem('livewave-params')
        if (this.config) {
            this.config = JSON.parse(this.config)
            this.username = this.config.username
        }
        else if (!this.username) {
            let usernames = username
            let randomIndex = Math.floor(Math.random() * usernames.length)
            this.username = usernames[randomIndex] + Math.floor(Math.random() * 100)
            localStorage.setItem('livewave-params', JSON.stringify({ username: this.username }))
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
</style>