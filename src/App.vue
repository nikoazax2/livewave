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