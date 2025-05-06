<template>
    <div>
        <div v-if="msg.reply">
            <v-icon class="mr-2">mdi-reply</v-icon>
            <strong :style="{ color: colorWithUsername(messagesReply.username) }" class="mr-2">
                {{ messagesReply.username }}
            </strong> {{ messagesReply.content }}
        </div>
        <div class="icons-actions-message" v-if="!reply">
            <v-icon @click="$emit('setanswer', msg)">
                mdi-reply
            </v-icon>
            <v-icon @click="$emit('addLike', msg.id)" :class="{
                pink: likedMessages?.includes(msg.id)
            }">
                mdi-heart
            </v-icon>
        </div>
        <!-- Message  -->
        <div v-if="!msg.shareMessage" class="message-like">
            <div>
                <strong :style="{ color: colorWithUsername(msg.username) }" class="mr-2">
                    {{ msg.username }}
                </strong> {{ msg.content }}
            </div>
            <div v-if="msg.likes > 0 && !reply" class="like">
                <v-icon class="mr-1" color="pink">mdi-heart</v-icon> {{ msg.likes }}
            </div>
        </div>
        <!-- Message PUB -->
        <div v-else> 
            <!-- https://www.facebook.com/sharer/sharer.php?u= -->
            <strong :style="{ color: colorWithUsername(msg.username) }" class="mr-2">{{ msg.username
            }}</strong>
            <div v-html="msg.content"></div>
            <div class="mt-2 d-flex">
                <v-btn v-for="social in socials" :key="social.name" variant="outlined" rounded class="mr-2" size="small" text @click="shareOn(chat, social.name, social.url)">
                    <v-icon class="mr-1">{{ social.icon }}</v-icon>
                    {{ social.name.charAt(0).toUpperCase() + social.name.slice(1) }}
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        msg: {
            type: Object,
            required: true
        },
        likedMessages: {
            type: Array,
            required: true
        },
        socials: {
            type: Array,
            required: true
        },
        reply: {
            type: Boolean,
            default: false
        },
        messages: {
            type: Array,
            required: false
        },
        chat: {
            type: Object,
            required: false
        },
    },
    computed: {
        messagesReply() {
            return this.messages.find(m => m.id === this.msg.reply);
        },
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
        shareOn(chat,social, url) { 
            let text = `Venez discuter de ${chat.title} sur LiveWave ! \n\n ${window.location.href} \n\n #${chat.title} #LiveWave`;
            let shareUrl = url + 'https://livewave.fr/chat/' + chat.title
            window.open(shareUrl, '_blank');
        },
    }
};
</script>

<style lang="scss" scoped>
.icons-actions-message {
    position: absolute;
    top: -11px;
    right: 20px;
    opacity: 0;
    background-color: rgb(71, 71, 71);
    padding: 5px;
    border-radius: 5px;
    z-index: 1;

    i {
        transform: translateY(-1px);
        margin: 0 3px;
        cursor: pointer;

        &.pink {
            color: #E91E63;
        }

        &:hover {
            transition: all 0.2s ease-in-out;
            color: #E91E63;
        }
    }
}

.message-like {
    .like {
        font-weight: 500;
        position: absolute;
        bottom: -10px;
        right: 20px;
        background-color: rgba(71, 71, 71, 0.5);
        border-radius: 5px;
        padding: 3px 3px 1px 3px;
        transform: scale(0.9);

        i {
            transform: translate(0, -2px);
        }
    }
}
</style>