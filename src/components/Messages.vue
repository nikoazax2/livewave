<template>
    <v-list id="chat-messages-list" ref="chatMessages" v-if="messages.length > 0">
        <v-list-item v-for="(msg, index) in messages" :key="index" class="chat-message" :style="{ backgroundColor: msg.backgroundColor }">
            <div>
                <Message :messages="messages" @addLike="$emit('addLike',$event)" @setanswer="$emit('setanswer',$event)" :msg="msg" :likedMessages="likedMessages" :socials="socials" />
            </div>
        </v-list-item>
    </v-list>
    <div v-else-if="loading" class="d-flex justify-center">
        <v-skeleton-loader class="w-100" type="text" :loading="true" :height="50" :width="100" :style="{ backgroundColor: 'rgba(255, 255, 255, 0)' }"></v-skeleton-loader>
    </div>
    <div v-else class="d-flex justify-center">
        <h4 class="text-center" :style="{ color: 'rgba(255, 255, 255,0.8)', fontWeight: 400 }">
            {{ language === 'fr' ? 'Aucun message pour le moment, soyez le premier à écrire !' : `No
            messages yet, be the first to write!` }}
        </h4>
    </div>
</template>

<script>
import Message from './Message.vue';
export default {
    name: 'Messages',
    components: {
        Message
    },
    props: {
        messages: {
            type: Array,
            required: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        socials: {
            type: Object,
            default: () => ({})
        },
        likedMessages: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<style scoped lang="scss">
.chat-message {
    // margin-bottom: 10px;
    margin-right: 10px!important;
    &:hover {
        transition: all 0.2s ease-in-out;
        background-color: rgba(0, 0, 0, 0.2);

        :deep(.icons-actions-message) {
            transition: all 0.2s ease-in-out;
            opacity: 1;
        }
    }
}
.v-list {
        background-color: rgba(255, 255, 255, 0);

        .v-list-item {
            margin: 0px;
            padding: 10px 10px !important;
            border-radius: 10px !important;
            min-height: unset;
        }
    }
</style>