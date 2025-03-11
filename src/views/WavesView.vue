<template>
    <div>
        <CreateChat @create-chat="createChat" ref="createChat" />
        <v-container class="wave-container">
            <v-card class="wave-card">
                <v-card-title>Salons Waves</v-card-title>
                <v-card-text class="wave-messages" ref="waveMessages">
                    <v-text-field prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" v-model="search" label="Chercher un évènement" hide-details="true"></v-text-field>

                    <v-list>
                        <div class="wave-messages-list">
                            <v-list-item @click="clickRoom(chat)" v-for="(chat, index) in chats?.filter(chat => chat.title.toLowerCase().includes(search.toLowerCase()))
                                ?.sort((a, b) => b.livers - a.livers)" :key="index" class="wave-message">
                                <div class="wave-message">
                                    <strong class="left">{{ chat.title }}</strong>
                                    <livers :livers="chat?.livers"></livers>
                                </div>
                            </v-list-item>
                        </div>

                        <div class="create-chat">
                            <v-btn size="small" rounded @click="$refs.createChat.dialog = true" elevation="0" color="rgba(46, 49, 50,1)" style="color: white; border: 1px solid white;">
                                <v-icon>
                                    mdi-plus
                                </v-icon>
                                Create a new chat
                            </v-btn>
                        </div>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-container>
    </div>
</template>

<script>
import { supabase } from '../supabase';
import CreateChat from '../components/CreateChat.vue';
import trends from '../../public/trends.json';
import Livers from '../components/LiversRedDot.vue';

export default {
    name: 'waves',
    components: {
        CreateChat,
        Livers
    },
    data() {
        return {
            chats: null,
            search: ''
        };
    },
    methods: {
        async clickRoom(chat) {
            if (chat.id) this.$router.push(`/chat/${chat.id}`)
            else {
                chat = await this.createChat(chat.title)
                this.$router.push(`/chat/${chat.id}`)
            }
        },
        async getRooms() {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) this.$toast.error(error.message);
            else {
                this.chats = data;
                trends.sort((a, b) => b.volume - a.volume);
                trends.forEach(trend => {
                    if (!this.chats.find(chat => chat.title === trend.trend)) {
                        let c = this.chats.push({ title: trend.trend, livers: 0 });
                    }
                });

            }
        },
        async createChat(chatName) {
            const { data, error } = await supabase.from('chats').insert([{ title: chatName }]);
            this.$refs.createChat.dialog = false;

            await this.getRooms();
            let c = this.chats.find(chat => chat.title === chatName);
            this.$router.push(`/chat/${c.id}`);
            return c
        }
    },
    mounted() {
        this.getRooms();
    }
};              
</script>

<style lang="scss">
.v-list-item__content {
    width: 100% !important;
}
</style>

<style scoped lang="scss">
.wave-container {
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
    padding: 16px 16px 30px 16px !important;
}

.wave-card {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 10px;
    background-color: rgba(46, 49, 50, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.363);
    padding: 10px 10px 0 10px;

    div {
        color: rgb(255, 255, 255) !important;
    }

    .wave-messages-list {
        height: calc(100% - 50px);
        overflow-y: auto;
    }
}

.wave-messages {
    height: 100%;
}

.wave-message {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 10px;

    .left {
        max-width: 80%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

}



.v-list {
    background-color: rgba(255, 255, 255, 0);
    font-size: 20px;
    font-weight: bold;
    height: calc(100% - 80px);
    display: flex;
    justify-content: space-between;
    flex-direction: column;


    .v-list-item {
        border-radius: 10px !important;
        padding: 10px;
        margin: 0;
        cursor: pointer;
    }
}
</style>