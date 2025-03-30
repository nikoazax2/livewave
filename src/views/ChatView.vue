<template>
    <v-container class="chat-container">
        <v-card class="chat-card">
            <v-card-title class="d-flex justify-space-between">
                <div class="d-flex align-center left">
                    <v-icon @click="$router.push({ name: 'waves' })">mdi-arrow-left</v-icon>
                    <div class="ml-4 title-caption">
                        <div class="title">{{ chat?.title }}</div>
                        <div class="caption">{{ chat?.description }}</div>
                    </div>

                </div>
                <LiversRedDot :livers="chat?.livers" />
            </v-card-title>
            <v-card-text class="chat-messages">
                <v-list id="chat-messages-list" ref="chatMessages">
                    <v-list-item v-for="(msg, index) in messages" :key="index" class="chat-message"
                        :style="{ backgroundColor: msg.backgroundColor }">
                        <div class="d-flex" v-if="!msg.shareMessage">
                            <strong :style="{ color: colorWithUsername(msg.username) }" class="mr-2">{{ msg.username
                            }}</strong>
                            <div v-html="msg.content"></div>
                        </div>
                        <div v-else>
                            <!-- https://www.facebook.com/sharer/sharer.php?u= -->
                            <strong :style="{ color: colorWithUsername(msg.username) }" class="mr-2">{{ msg.username
                            }}</strong>
                            <div v-html="msg.content"></div>
                            <div class="mt-2 d-flex">
                                <v-btn v-for="social in socials" :key="social.name" variant="outlined" rounded
                                    class="mr-2" size="small" text @click="shareOn(social.name, social.url)">
                                    <v-icon class="mr-1">{{ social.icon }}</v-icon>
                                    {{ social.name.charAt(0).toUpperCase() + social.name.slice(1) }}
                                </v-btn>
                            </div>
                        </div>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-text-field variant="outlined" append-inner-icon="mdi-send" rounded v-model="newMessage"
                    :label="texts[language]?.writeMessage" @keyup.enter="sendMessage"
                    @click:append-inner="sendMessage" />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import { supabase } from '../supabase';
import { useToast } from 'vue-toastification';
import LiversRedDot from '../components/LiversRedDot.vue';
import trends from '../../public/trends.json';
import messagesbots from '../../public/messagesbots.json';
import usernames from '../assets/usernames.json';

export default {
    name: 'App',
    props: {
        username: String,
        bots: Boolean,
        language: String
    },
    components: {
        LiversRedDot
    },
    data() {
        return {
            enventNow: false,
            messages: [],
            newMessage: '',
            chatId: null,
            chat: null,
            chats: null,
            firstMessage: true,
            deleteMessages: false,
            socials: [{
                icon: 'mdi-facebook',
                name: 'facebook',
                url: 'https://www.facebook.com/sharer/sharer.php?u='
            },
            {
                icon: 'mdi-twitter',
                name: 'twitter',
                url: 'https://twitter.com/intent/tweet?text='
            },
            {
                icon: 'mdi-linkedin',
                name: 'linkedin',
                url: 'https://www.linkedin.com/shareArticle?mini=true&url='
            },
            {
                icon: 'mdi-whatsapp',
                name: 'whatsapp',
                url: 'https://api.whatsapp.com/send?text='
            }],
            texts: {
                en: {
                    writeMessage: 'Write a message',
                },
                fr: {
                    writeMessage: 'Écrire un message',
                }
            }
        };
    },
    async mounted() {
        if (this.$route.params.id == '4aec1267-0595-4fe5-ab8e-89093906b4d5') {
            this.$route.params.id = '6e3eec90-163a-4754-99fa-27b894dd6428';
        }

        // Check if the chat ID is a UUID or a title and get the chat ID
        let regexUUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
        if (this.$route.params.id.match(regexUUID)) {
            this.chatId = this.$route.params.id;
        } else {
            await supabase
                .from('chats')
                .select('*')
                .eq('title', this.$route.params.id)
                .then(async ({ data, error }) => {
                    if (error) {
                        console.error('Error fetching chat:', error);
                    } else {
                        if (data?.[0]?.id) {
                            this.chatId = data[0].id;
                        }
                        else {
                            let c = await this.createChat(this.$route.params.id);
                            this.chatId = c.id;
                        }
                    }
                });
        }

        this.getRooms();
        await this.getChatInfo();
        let messagesbots = await this.getEvent();
        await this.getMessages(messagesbots);
        this.setLivers();
        this.liversLoop();
        this.deleteMessagesLoop();
        if (this.bots) this.sendBotMessage();
        this.adMessage();

        const chatMessagesList = document.getElementById('chat-messages-list');
        const observer = new MutationObserver(() => {
            chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
        });

        observer.observe(chatMessagesList, { childList: true });

    },
    methods: {
        setLivers() {
            if (this.enventNow) this.chat.livers = Math.floor(Math.random() * 1500) + 1200;
        },
        async getEvent() {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('name', this.chat.title)
                .single();

            let chatMessages = data.messages;
            let dateNow = new Date();
            if (dateNow > new Date(data.datestart) && dateNow < new Date(data.dateend)) {
                this.enventNow = true;
            }
            return chatMessages;
        },
        shareOn(social, url) {
            let text = `Venez discuter de ${this.chat.title} sur LiveWave ! \n\n ${window.location.href} \n\n #${this.chat.title} #LiveWave`;
            let shareUrl = url + encodeURIComponent(text);
            window.open(shareUrl, '_blank');
        },
        adMessage() {
            //Every 1 minutes send a message telling "LiveWave à besoin de vous pour continuer à vivre, vous pouvez aider en partageant le lien de la page"
            setInterval(() => {
                //send if there is no share message in last 5 messages
                if (this.messages.slice(-5).findIndex(msg => msg.shareMessage) !== -1) return;
                let msg = this.language === 'fr' ? 'LiveWave à besoin de vous pour continuer à exister, <br> vous pouvez aider en partageant l\'événement :' : 'LiveWave needs you to continue to exist, <br> you can help by sharing the event :';
                this.messages.push({
                    username: 'LiveWave',
                    content: msg,
                    created_at: new Date().toISOString(),
                    backgroundColor: '#6200EA',
                    shareMessage: true //to add share buttons
                });
            }, 60000); //every 1 minute
        },
        sendBotMessage() {
            const minTimeS = 3;
            const maxTimeS = 8;

            const sendMessage = () => {
                if (!this.enventNow) return;
                // Only if there is a message with bot true
                if (this.messages.length == 0 || this.messages?.filter(msg => msg.bot).length == 0) return;

                let randomIndex = Math.floor(Math.random() * usernames.length);
                let usernameS = usernames[randomIndex] + Math.floor(Math.random() * 100);

                let botMessage;
                let attempts = 0;
                const maxAttempts = 10;

                // Ensure the message is not in the last 10 messages
                do {
                    botMessage = this.messages[Math.floor(Math.random() * (Math.floor(this.messages.length / 1.5)))];
                    attempts++;
                } while (
                    attempts < maxAttempts &&
                    this.messages.slice(-10).some(msg => msg.content === botMessage?.content)
                );

                if (!botMessage) return;

                this.messages.push({
                    username: usernameS,
                    content: botMessage?.content,
                    created_at: new Date().toISOString(),
                    bot: true
                });
            };

            // Send the first message within 3 seconds
            setTimeout(() => {
                for (let i = 0; i < 5; i++) {
                    sendMessage();
                }

                // Continue sending messages between minTimeS and maxTimeS
                setInterval(sendMessage, Math.floor(Math.random() * (maxTimeS - minTimeS + 1) + minTimeS) * 1000);
            }, Math.floor(Math.random() * 3000));
        },
        deleteMessagesLoop() {
            if (!this.deleteMessages) return;
            //every 10second deletes messages exist for more than 2 minutes (only in frontend)
            const deleteMessageAfterS = 40
            setInterval(() => {
                let now = new Date();
                this.messages = this.messages.filter(msg => {
                    let date = new Date(msg.created_at);

                    return (now - date) < deleteMessageAfterS * 1000;
                });
            }, 1000);
        },
        async createChat(chatName) {
            const { data, error } = await supabase.from('chats').insert([{ title: chatName }]);
            await this.getRooms();
            let c = this.chats.find(chat => chat.title === chatName);
            this.$router.push(`/chat/${c.id}`);
            return c
        },
        async getRooms() {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .order('created_at', { ascending: false });

            this.chats = data;
            trends.sort((a, b) => b.volume - a.volume);
            trends.forEach(trend => {
                if (!this.chats.find(chat => chat.title === trend.trend)) {
                    let c = this.chats.push({ title: trend.trend, livers: 0 });
                }
            });
        },
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
        async getMessages(messagesbots) {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', this.chatId)

            if (error) {
                console.error('Error fetching messages:', error);
            } else {
                this.messages = data;
                let chatMessages = []

                try {
                    chatMessages = messagesbots
                    for (let i = 0; i < chatMessages.length; i++) {
                        let date5DaysAgo = new Date();
                        date5DaysAgo.setDate(date5DaysAgo.getDate() - 5);

                        let randomIndex = Math.floor(Math.random() * usernames.length)
                        let username = usernames[randomIndex] + Math.floor(Math.random() * 100)

                        this.messages.push({
                            content: chatMessages[i],
                            username: username,
                            created_at: date5DaysAgo.toISOString(),
                            backgroundColor: null,
                            bot: true,
                        })
                        this.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    }

                } catch (e) {
                    console.error('Error loading chat messages:', e);
                }


                document.getElementById('chat-messages-list').scrollTop = document.getElementById('chat-messages-list').scrollHeight
            }

            supabase
                .channel('public:messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                    if (payload.new.chat_id !== this.chatId) return;
                    this.messages.push(payload.new);
                    let chat = document.getElementById('chat-messages-list');
                    chat.scrollTop = chat.scrollHeight + 20;
                })
                .subscribe();

            return
        },
        async sendMessage() {
            const toast = useToast();
            if (this.newMessage.length > 200) {
                // toast.error('Message trop long');
                window.alert('Message trop long');
                return;
            }
            if (this.newMessage) {
                let mess = await supabase
                    .from('messages')
                    .insert([{
                        chat_id: this.chatId,
                        username: this.username,
                        content: this.newMessage
                    }]);
                this.newMessage = '';
            }
        },
        async getChatInfo() {
            let l = await supabase
                .from('chats')
                .select('*')
                .eq('id', this.chatId)
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error fetching chat:', error);
                    } else {
                        this.chat = data[0];

                    }
                });
            return
        },
        addLiver() {
            supabase
                .from('chats')
                .update({ livers: this.chat.livers + 1 })
                .eq('id', this.chatId)
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
    }
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
    padding: 16px 16px 30px 16px !important;
}

.chat-card {
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

    .left {
        max-width: calc(100% - 100px);
        overflow: hidden;

        .title-caption {
            width: 100%;

            .title {
                font-size: 20px;
                font-weight: 500;
            }

            .caption {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
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