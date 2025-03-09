<template>
    <div>
        <SetUser @set-username="setUsername" v-if="askUsername" />
        <router-view :username="username" :chatId="$route.params.id"></router-view>
    </div>
</template>

<script>
import SetUser from './components/SetUser.vue';

export default {
    name: 'App',
    components: {
        SetUser
    },
    data() {
        return {
            username: null,
            askUsername: false,
            config: null,
        };
    },
    created() {
        this.config = localStorage.getItem('livewave-params')
        if (this.config) {
            this.config = JSON.parse(this.config)
            this.username = this.config.username
        }
        else if (!this.username) {
            this.askUsername = true
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