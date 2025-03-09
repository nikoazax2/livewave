<template>
    <v-container class="chat-container">
        <v-card class="chat-card">
            <v-card-title>Waves rooms</v-card-title>
            <v-card-text class="chat-messages" ref="chatMessages">
                <v-list>
                    <v-list-item
                    @click="this.$router.push(`/chat/${chat.id}`)"
                    v-for="(chat, index) in chats" :key="index" class="chat-message">
                        <strong>{{ chat.title }}</strong> {{ chat.description }}
                    </v-list-item>
                </v-list>
            </v-card-text> 
        </v-card>
    </v-container>
</template>

<script>
import { supabase } from '../supabase';

export default {
    name: 'App',
    data() {
        return {
            chats:  null
        };
    },
    methods: {
        async getRooms() {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .order('created_at', { ascending: false }); 
            if (error) this.$toast.error(error.message);
            else this.chats = data;
        },
    },
    mounted() { 
        this.getRooms();
    }
};              
</script> 
<style scoped lang="scss">
.chat-container {
    height: 100vh !important;
    width: 100vw !important;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden !important;
    margin: 0 !important;
    max-width: none !important;
    background: url('../assets/backgroundchat.png') center center fixed;
    background-size: 100px 100px;
}

.chat-card {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 10px;
    background-color: rgba(204, 204, 204, 0.95);
}
 
 .v-list {
    background-color: rgba(255, 255, 255, 0);
    font-size: 20px;
    font-weight: bold;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    }
 }
</style>