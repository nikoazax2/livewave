<template>
  <div id="chat-messages-list" ref="chatMessages" class="messages">
    <template v-if="messages.length > 0">
      <div v-for="(msg, index) in messages" :key="msg.id || index" class="message-row">
        <Message
          :chat="chat"
          :messages="messages"
          :msg="msg"
          :likedMessages="likedMessages"
          :socials="socials"
          :language="language"
          :own="!!username && msg.username === username && !msg.bot"
          @addLike="$emit('addLike', $event)"
          @setanswer="$emit('setanswer', $event)"
        />
      </div>
    </template>
    <div v-else-if="loading" class="state">
      <div v-for="n in 5" :key="n" class="skeleton" :style="{ width: `${40 + ((n * 17) % 45)}%` }"></div>
    </div>
    <div v-else class="state empty">
      <div class="empty-orb"><v-icon size="30">mdi-chat-processing-outline</v-icon></div>
      <p>{{ $texts[language]?.noMessages }}</p>
    </div>
  </div>
</template>

<script>
import Message from "./Message.vue";
export default {
  name: "Messages",
  components: {
    Message,
  },
  props: {
    messages: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    socials: {
      type: Array,
      default: () => [],
    },
    likedMessages: {
      type: Array,
      default: () => [],
    },
    language: {
      type: String,
      default: "en",
    },
    chat: {
      type: Object,
      required: false,
    },
    username: {
      type: String,
      default: null,
    },
  },
};
</script>

<style scoped lang="scss">
.messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scroll-behavior: smooth;
  mask-image: linear-gradient(180deg, transparent 0, #000 24px);
}

.message-row {
  animation: lw-rise 0.35s ease both;
}

.state {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
}

.skeleton {
  height: 42px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

.empty {
  margin: auto;
  align-items: center;
  text-align: center;
  color: var(--lw-muted);

  .empty-orb {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 30% 30%, rgba(139, 61, 255, 0.5), rgba(77, 124, 255, 0.15));
    box-shadow: 0 0 60px rgba(139, 61, 255, 0.45);
    color: white;
    animation: float 4s ease-in-out infinite;
  }

  p {
    max-width: 280px;
    margin: 0;
  }
}

@keyframes float {
  50% {
    transform: translateY(-8px);
  }
}
</style>
