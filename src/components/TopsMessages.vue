<template>
    <v-container class="card-container">
        <v-card class="card-in">
            <Messages :messages="messages" :loading="loading" :socials="socials" :likedMessages="likedMessages" @addLike="addLike" @setanswer="answer = $event" />
        </v-card>
    </v-container>
</template>

<script>
export default {
    name: 'TopsMessages',
    props: {
        messages: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
        };
    },
    methods: {
    }
};
</script>