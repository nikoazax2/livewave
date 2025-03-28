<template>
    <div>
        <CreateChat @create-chat="createChat" ref="createChat" :title="search" :language="language" />
        <v-container class="wave-container">
            <v-card class="wave-card">
                <v-card-title>
                    <div class="d-flex justify-space-between align-center">
                        <div class="mr-6">
                            <!-- {{ texts[language]?.room }} -->
                              <img src="../../public/logobigwhite.png"  height="40" alt="logo" class="ml-1" style="transform: translateY(7px);" />
                        </div>
                        <div style="width: 100%; max-width: 300px;" class="d-flex justify-space-between align-center">
                            <v-text-field class="mr-4" rounded prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" v-model="search" :label="texts[language]?.search" hide-details="true"></v-text-field>
                            <v-icon size="24" @click="$emit('setaskUsername', true)">mdi-cog</v-icon>
                            <div class="ml-2 align-center d-flex" style="cursor: pointer;">
                                <img v-if="language === 'en'" src="../assets/flags/en.png" width="24" height="24" @click="$emit('setLanguage', 'fr')" />
                                <img v-else src="../assets/flags/fr.png" width="24" height="24" @click="$emit('setLanguage', 'en')" />
                            </div>
                        </div>
                    </div>
                </v-card-title>
                <v-card-text class="wave-messages" ref="waveMessages">
                    <v-list>
                        <div class="wave-messages-list">
                            <v-list-item @click="clickRoom(chat)" v-for="(chat, index) in roomsBySearch" :key="index" class="wave-message">
                                <div class="wave-message">
                                    <div class="left">
                                        <strong>{{ chat.title }}</strong>
                                        <div class="caption">
                                            {{ chat.description }}
                                        </div>
                                    </div>
                                    <livers :livers="chat?.livers"></livers>
                                </div>

                            </v-list-item>
                            <!-- last line to create a new chat -->
                            <v-list-item v-if="search.length > 0 && !chats?.filter(chat => chat.title.toLowerCase().includes(search.toLowerCase()))?.length" @click="$refs.createChat.dialog = true" class="wave-message create-chat-line">
                                <div class="left">
                                    <strong>
                                        {{ texts[language]?.dontExist.title }}
                                    </strong>
                                    <div class="caption">
                                        {{ texts[language]?.dontExist.description }}
                                    </div>
                                </div>
                            </v-list-item>
                        </div>

                        <div class="create-chat">
                            <v-btn size="small" rounded @click="$refs.createChat.dialog = true" elevation="0" color="rgba(46, 49, 50,1)" style="color: white; border: 1px solid white;">
                                <v-icon>
                                    mdi-plus
                                </v-icon>
                                {{ texts[language]?.createRoom }}
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
    props: {
        bots: Boolean,
        language: String
    },
    data() {
        return {
            chats: [],
            search: '',
            texts: {
                en: {
                    welcomeMessage: 'Welcome to LiveWave',
                    room: 'Waves Rooms',
                    description: 'LiveWave is a real-time conversation app around the events you love!',
                    search: 'Search an event...',
                    dontExist: {
                        title: 'This room does not exist yet',
                        description: 'Create it now to discuss it with the whole world!'
                    },
                    createRoom: 'Create a room'
                },
                fr: {
                    welcomeMessage: 'Bienvenue sur LiveWave',
                    room: 'Salons Waves',
                    description: 'LiveWave est une application de conversation en temps réel autour des événements qui vous passionnent !',
                    search: 'Chercher un évènement...',
                    dontExist: {
                        title: 'Ce salon n\'existe pas encore',
                        description: 'Crée le maintenant pour en discuter avec le monde entier !'
                    },
                    createRoom: 'Créer un salon'
                }
            }
        };
    },
    computed: {
        roomsBySearch() {
            return this.chats?.filter(chat => chat.title.toLowerCase().includes(this.search.toLowerCase()) || chat.description?.toLowerCase().includes(this.search.toLowerCase())).sort((a, b) => b.livers - a.livers)
        }
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
                this.chats.forEach(chat => {
                    if (chat?.livers < 3 && this.bots) {
                        if (chat.livers == 0) chat.livers = Math.floor(Math.random() * 20) + 4;
                        else chat.livers = chat.livers * Math.floor(Math.random() * 2) + 1;
                    } else if (chat?.livers < 10) {
                        if (chat.livers > 0) chat.livers = Math.floor(Math.random() * 20) + 4;
                        else chat.livers = Math.floor(Math.random() * 4);
                    }

                });
            }
        },
        async createChat(chatName, chatDescription) {
            const { data, error } = await supabase.from('chats').insert([{ title: chatName, description: chatDescription }]);
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
    background-color: rgba(46, 49, 50, 0.5);
    // border: 1px solid rgba(255, 255, 255, 0.363);
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

    .caption {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
        opacity: 0.7;
        font-weight: normal;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

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
    height: calc(100% - 50px);
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