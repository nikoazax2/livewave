<template>
  <div class="message" :class="{ own, share: msg.shareMessage, compact: reply }">
    <div class="avatar" :style="{ background: avatarColor(msg.username) }">{{ initial(msg.username) }}</div>

    <div class="bubble-wrap">
      <div class="bubble" :style="msg.backgroundColor && !msg.shareMessage ? { background: msg.backgroundColor } : null">
        <div v-if="msg.reply && messagesReply" class="quoted">
          <v-icon size="14">mdi-reply</v-icon>
          <strong :style="{ color: nameColor(messagesReply.username) }">{{ messagesReply.username }}</strong>
          <span>{{ messagesReply.content }}</span>
        </div>

        <strong class="name" :style="{ color: own ? 'white' : nameColor(msg.username) }">{{ msg.username }}</strong>

        <template v-if="!msg.shareMessage">
          <span class="content">{{ msg.content }}</span>
        </template>
        <template v-else>
          <div class="content" v-html="msg.content"></div>
          <div class="share-buttons">
            <button v-for="social in socials" :key="social.name" class="share-btn" @click="shareOn(chat, social.name, social.url)">
              <v-icon size="16">{{ social.icon }}</v-icon>
              {{ social.name.charAt(0).toUpperCase() + social.name.slice(1) }}
            </button>
          </div>
        </template>
      </div>

      <div v-if="!reply && !msg.shareMessage" class="meta">
        <span v-if="msg.likes > 0" class="likes"><v-icon size="13">mdi-heart</v-icon>{{ msg.likes }}</span>
        <div class="actions">
          <button :aria-label="$texts[language]?.reply" @click="$emit('setanswer', msg)">
            <v-icon size="16">mdi-reply</v-icon>
          </button>
          <button
            :aria-label="$texts[language]?.like"
            :class="{ liked: likedMessages?.includes(msg.id) }"
            @click="like"
          >
            <v-icon size="16">mdi-heart</v-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import confetti from "canvas-confetti";

const hashOf = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
};

export default {
  props: {
    msg: {
      type: Object,
      required: true,
    },
    likedMessages: {
      type: Array,
      default: () => [],
    },
    socials: {
      type: Array,
      default: () => [],
    },
    reply: {
      type: Boolean,
      default: false,
    },
    messages: {
      type: Array,
      required: false,
    },
    chat: {
      type: Object,
      required: false,
    },
    language: {
      type: String,
      default: "en",
    },
    own: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    messagesReply() {
      return this.messages?.find((m) => m.id === this.msg.reply);
    },
  },
  methods: {
    nameColor(username) {
      return `hsl(${hashOf(username) % 360} 85% 72%)`;
    },
    avatarColor(username) {
      const h = hashOf(username) % 360;
      return `linear-gradient(135deg, hsl(${h} 85% 58%), hsl(${(h + 50) % 360} 85% 48%))`;
    },
    initial(username = "") {
      return (username.match(/\p{L}|\p{N}/u)?.[0] || "?").toUpperCase();
    },
    like(event) {
      if (!this.likedMessages?.includes(this.msg.id)) {
        const r = event.currentTarget.getBoundingClientRect();
        confetti({
          particleCount: 22,
          spread: 60,
          startVelocity: 18,
          scalar: 0.7,
          ticks: 60,
          colors: ["#ff3d8b", "#8b3dff", "#4d7cff", "#ffffff"],
          origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
          disableForReducedMotion: true,
        });
      }
      this.$emit("addLike", this.msg.id);
    },
    shareOn(chat, social, url) {
      let shareUrl = url + "https://livewave.fr/chat/" + chat.title;
      window.open(shareUrl, "_blank");
    },
  },
};
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 100%;

  &.own {
    flex-direction: row-reverse;

    .bubble-wrap {
      align-items: flex-end;
    }

    .bubble {
      background: var(--lw-gradient);
      border-color: transparent;
      border-bottom-right-radius: 6px;
      border-bottom-left-radius: 20px;
      box-shadow: 0 10px 30px -12px rgba(139, 61, 255, 0.8);
    }

    .meta {
      flex-direction: row-reverse;
    }
  }

  &.compact {
    .avatar {
      display: none;
    }
  }
}

.avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--lw-font-display);
  font-weight: 700;
  font-size: 14px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.6);
}

.bubble-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: min(78%, 560px);
}

.bubble {
  padding: 9px 14px 10px;
  border-radius: 20px;
  border-bottom-left-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid var(--lw-border);
  line-height: 1.4;
  font-size: 15px;
  overflow-wrap: anywhere;

  .name {
    display: block;
    font-size: 12.5px;
    font-weight: 600;
    margin-bottom: 1px;
  }
}

.quoted {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  margin-bottom: 6px;
  padding: 4px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.22);
  border-left: 2px solid rgba(255, 255, 255, 0.4);
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;

  span {
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  padding: 2px 6px 0;
}

.likes {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  color: #ff8ab8;
}

.actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.15s, transform 0.15s;

  button {
    width: 26px;
    height: 20px;
    border: none;
    background: none;
    color: var(--lw-muted);
    cursor: pointer;
    border-radius: 6px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--lw-pink);
      background: rgba(255, 255, 255, 0.06);
    }

    &.liked {
      color: var(--lw-pink);
    }

    &:focus-visible {
      outline: 2px solid var(--lw-violet);
    }
  }
}

.message:hover .actions,
.message:focus-within .actions {
  opacity: 1;
  transform: none;
}

@media (hover: none) {
  .actions {
    opacity: 0.7;
    transform: none;
  }
}

.share {
  .bubble-wrap {
    max-width: 100%;
  }

  .bubble {
    background: linear-gradient(135deg, rgba(77, 124, 255, 0.22), rgba(255, 61, 139, 0.18));
    border-color: rgba(139, 61, 255, 0.35);
  }
}

.share-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  color: white;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--lw-border-strong);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
}
</style>
