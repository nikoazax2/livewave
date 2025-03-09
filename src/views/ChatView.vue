<template>
    <v-container class="chat-container">
        <v-card class="chat-card">
            <v-card-title>LiveWave Chat</v-card-title>
            <v-card-text class="chat-messages" ref="chatMessages">
                <v-list>
                    <v-list-item v-for="(msg, index) in messages" :key="index" class="chat-message">
                        <strong>{{ msg.user }}:</strong> {{ msg.text }}
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-text-field variant="outlined" append-inner-icon="mdi-send" rounded v-model="newMessage"
                    label="Écrire un message" @keyup.enter="sendMessage" @click:append-inner="sendMessage" />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
            messages: [
                { user: 'Alice', text: 'Salut !' },
                { user: 'Bob', text: 'Ça va ?' }
            ],
            newMessage: ''
        };
    },
    methods: {
        sendMessage() {
            if (this.newMessage.trim()) {
                this.messages.push({ user: 'Moi', text: this.newMessage });
                this.newMessage = '';
                this.scrollToBottom();
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const chatMessages = this.$refs.chatMessages;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        }
    },
    mounted() {
        this.scrollToBottom();
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

.chat-messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column-reverse;

    .v-list {
        background-color: rgba(255, 255, 255, 0);

    }
}

.chat-message {
    margin-bottom: 10px;
}
</style>