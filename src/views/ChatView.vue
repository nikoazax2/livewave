<template>
    <v-container class="chat-container">
        <v-card class="chat-card">
            <v-card-title class="d-flex justify-space-between">
                <div>
                    <v-icon @click="$router.push({ name: 'waves' })">mdi-arrow-left</v-icon>
                    {{ chat?.title }}
                </div>
                <div>
                    <LiversRedDot :livers="chat?.livers" />
                </div>
            </v-card-title>
            <v-card-text class="chat-messages">
                <v-list id="chat-messages-list" ref="chatMessages">
                    <v-list-item v-for="(msg, index) in messages" :key="index" class="chat-message">
                        <strong :style="{ color: colorWithUsername(msg.username) }">{{ msg.username }}</strong> {{
                            msg.content }}
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-text-field variant="outlined" append-inner-icon="mdi-send" rounded v-model="newMessage" label="Écrire un message" @keyup.enter="sendMessage" @click:append-inner="sendMessage" />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import { supabase } from '../supabase';
import { useToast } from 'vue-toastification';
import LiversRedDot from '../components/LiversRedDot.vue';

export default {
    name: 'App',
    props: {
        username: String,
        chatId: String
    },
    components: {
        LiversRedDot
    },
    data() {
        return {
            messages: [],
            newMessage: '',
            chatId: this.$route.params.id,
            chat: null
        };
    },
    methods: {
        colorWithUsername(username) {
            // Simple hash function to generate a number from the username
            let hash = 0;
            for (let i = 0; i < username.length; i++) {
                hash = username.charCodeAt(i) + ((hash << 5) - hash);
            }
            // Convert the hash to a hex color code
            let color = '#';
            for (let i = 0; i < 3; i++) {
                const value = (hash >> (i * 8)) & 0xFF;
                color += ('00' + value.toString(16)).substr(-2);
            }
            return color;
        },
        async getMessages() {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', this.$route.params.id);

            if (error) {
                console.error('Error fetching messages:', error);
            } else {
                this.messages = data;
                document.getElementById('chat-messages-list').scrollTop = document.getElementById('chat-messages-list').scrollHeight
            }

            supabase
                .channel('public:messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                    this.messages.push(payload.new);
                    let chat = document.getElementById('chat-messages-list');
                    chat.scrollTop = chat.scrollHeight + 20;
                })
                .subscribe();
        },
        async sendMessage() {
            const toast = useToast();
            if (this.newMessage.length > 200) {
                toast.error('Message trop long');
                return;
            }
            if (this.newMessage) {
                let mess = await supabase
                    .from('messages')
                    .insert([{
                        chat_id: this.$route.params.id,
                        username: this.username,
                        content: this.newMessage
                    }]);
                this.newMessage = '';
            }
        },
        getChatInfo() {
            supabase
                .from('chats')
                .select('*')
                .eq('id', this.$route.params.id)
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error fetching chat:', error);
                    } else {
                        this.chat = data[0];
                    }
                });
        },
        addLiver() {
            supabase
                .from('chats')
                .update({ livers: this.chat.livers + 1 })
                .eq('id', this.$route.params.id)
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error adding liver:', error);
                    } else {
                        this.chat.livers++;
                    }
                });
        },
        liversLoop() {
            setInterval(() => {
                const minutes = new Date().getMinutes();
                const seconds = new Date().getSeconds();
                if (minutes % 2 === 1 && seconds === 2) {
                    this.addLiver();
                }
            }, 1000); // Check every second
        }
    },
    async mounted() {
        this.getMessages();
        this.getChatInfo();

        this.liversLoop();
    },
}
</script>

<style>
html,
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
}
</style>

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
    background-color: rgba(46, 49, 50, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.363);
    padding: 10px 10px 0 10px;

    div {
        color: rgb(255, 255, 255) !important;
    }
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column-reverse;

    .v-list {
        background-color: rgba(255, 255, 255, 0);

        .v-list-item {
            margin: 0px;
            padding: 10px 10px !important;
            border-radius: 10px;
            min-height: unset;
        }
    }
}

.chat-message {
    margin-bottom: 10px;
}
</style>