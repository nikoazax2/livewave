<template>
  <div class="chat-shell">
    <section class="chat-panel glass">
      <BorderBeam :size="260" :duration="12000" color-from="#4d7cff" color-to="#ff3d8b" :border-width="1.5" />
      <header class="chat-header">
        <button
          v-if="!implemented"
          class="icon-btn"
          :aria-label="$texts[language]?.back"
          @click="$router.push({ name: 'waves' }), $emit('backgroundImage', null)"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </button>
        <div class="title-caption">
          <h1 class="title">{{ chat?.title_full || chat?.title }}</h1>
          <div v-if="chat?.description" class="caption">{{ chat?.description }}</div>
        </div>
        <span class="live-pill"><span class="dot"></span><NumberTicker :value="chat?.livers || 0" :decimal-places="0" :duration="1200" /></span>
        <div class="header-actions">
          <button class="icon-btn" :aria-label="$texts[language]?.contact" @click="$emit('setContact', true)">
            <v-icon>mdi-email-heart-outline</v-icon>
          </button>
          <div class="icon-btn" :aria-label="$texts[language]?.language">
            <SetLanguage @setLanguage="$emit('setLanguage', $event)" :language="language" />
          </div>
          <button class="icon-btn" :aria-label="$texts[language]?.settings" @click="$emit('setaskUsername', true)">
            <v-icon>mdi-account-cog-outline</v-icon>
          </button>
        </div>
      </header>

      <Teams @teamClick="teamClick" :teams="event.teams" v-if="event?.teams?.length" :vote="vote" @vote="vote = $event" />

      <Messages
        :language="language"
        :chat="chat"
        :messages="messages"
        :loading="loading"
        :socials="socials"
        :likedMessages="likedMessages"
        :username="username"
        @addLike="addLike"
        @setanswer="answer = $event"
      />

      <footer class="composer">
        <div class="reply-preview" v-if="answer">
          <v-icon size="18">mdi-reply</v-icon>
          <div class="reply-text">
            <strong>{{ answer.username }}</strong> {{ answer.content }}
          </div>
          <button class="icon-btn small" aria-label="close" @click="answer = null"><v-icon>mdi-close</v-icon></button>
        </div>
        <VanishingInput
          v-model="newMessage"
          class="composer-input"
          :placeholders="$texts[language]?.composer || [$texts[language]?.writeMessage]"
          @submit="sendMessage"
        />
      </footer>
    </section>
  </div>
</template>

<script>
import { supabase } from "../supabase";
import { pulseBackground } from "../background";
import { useToast } from "vue-toastification";
import LiversRedDot from "../components/LiversRedDot.vue";
import trends from "../../public/trends.json";
import messagesbots from "../../public/messagesbots.json";
import usernames from "../assets/usernames.json";
import leoProfanity from "leo-profanity";
import bannedWords from "../assets/bannedwords.json";
import Message from "../components/Message.vue";
import Messages from "../components/Messages.vue";
import Teams from "../components/Teams.vue";
import SetLanguage from "../components/SetLanguage.vue";
import { VanishingInput } from "../components/inspira/vanishing-input";
import { NumberTicker } from "../components/inspira/number-ticker";
import { BorderBeam } from "../components/inspira/border-beam";
leoProfanity.loadDictionary("fr");
leoProfanity.add(bannedWords);

export default {
  name: "App",
  props: {
    username: String,
    bots: Boolean,
    language: String,
    themeDark: Boolean,
    mobile: Boolean,
    backgroundImage: String,
  },
  components: {
    SetLanguage,
    VanishingInput,
    NumberTicker,
    BorderBeam,
    LiversRedDot,
    Messages,
    Message,
    Teams,
  },
  data() {
    return {
      vote: null,
      implemented: false,
      forcebot: 0,
      enventNow: false,
      messages: [],
      newMessage: "",
      chatId: null,
      chat: null,
      chats: null,
      firstMessage: true,
      loading: true,
      deleteMessages: false,
      likedMessages: [],
      answer: null,
      event: null,
      socials: [
        {
          icon: "mdi-facebook",
          name: "facebook",
          url: "https://www.facebook.com/sharer/sharer.php?u=",
        },
        {
          icon: "mdi-twitter",
          name: "twitter",
          url: "https://twitter.com/intent/tweet?text=",
        },
        {
          icon: "mdi-linkedin",
          name: "linkedin",
          url: "https://www.linkedin.com/shareArticle?mini=true&url=",
        },
        {
          icon: "mdi-whatsapp",
          name: "whatsapp",
          url: "https://api.whatsapp.com/send?text=",
        },
      ],
    };
  },
  async mounted() {
    if (this.$route.params.id == "4aec1267-0595-4fe5-ab8e-89093906b4d5") {
      this.$route.params.id = "6e3eec90-163a-4754-99fa-27b894dd6428";
    }
    if (this.$route.query.implemented == "1") this.implemented = true;

    // Check if the chat ID is a UUID or a title and get the chat ID
    let regexUUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    if (this.$route.params.id.match(regexUUID)) {
      this.chatId = this.$route.params.id;
    } else {
      await supabase
        .from("chats")
        .select("*")
        .ilike("title", this.$route.params.id)
        .then(async ({ data, error }) => {
          if (error) {
            console.error("Error fetching chat:", error);
          } else {
            if (data?.[0]?.id) {
              this.chatId = data[0].id;
            } else {
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
    this.setTeam();
    this.storeUserInfos();

    //set title of the page with the chat name
    document.title = `LiveWave - ${this.chat?.title_full || this.chat?.title}`;

    const chatMessagesList = document.getElementById("chat-messages-list");
    if (chatMessagesList) {
      this.observer = new MutationObserver(() => {
        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
      });
      this.observer.observe(chatMessagesList, { childList: true, subtree: true });
    }

    //after  2s scroll to bottom (transition of 1s)
    setTimeout(async () => {
      let chat = document.getElementById("chat-messages-list");
      if (chat) chat.scrollTop = chat.scrollHeight + 20;

      // let height = chat.scrollHeight
      // let documentHeight = document.documentElement.scrollHeight
      // height = chat.scrollHeight - documentHeight + chat.scrollTop + 200;

      // while (height >= chat.scrollTop) {
      //     chat.scrollTop += 20;
      //     await new Promise(resolve => setTimeout(resolve, 1));
      // }
    }, 200);
  },
  created() {
    this.intervals = [];
  },
  beforeUnmount() {
    this.intervals.forEach(clearInterval);
    this.observer?.disconnect();
    if (this.channel) supabase.removeChannel(this.channel);
  },
  methods: {
    setTeam() {
      if (!this.event?.teams) return;
      let params = JSON.parse(localStorage.getItem("livewave-params") || "{}");
      params.teams = params.teams || [];

      const currentTeam = params.teams.find((t) => t.event_id === this.event.id);
      if (currentTeam) {
        this.vote = this.event.teams.find((t) => t.id === currentTeam.team_id);
      } else {
        this.vote = null;
      }
    },
    async teamClick(team, add = true) {
      let params = JSON.parse(localStorage.getItem("livewave-params") || "{}");
      params.teams = params.teams || [];

      const currentTeam = params.teams.find((t) => t.event_id === this.event.id);
      const isSameTeam = currentTeam?.team_id === team.id;

      if (currentTeam && !isSameTeam) {
        await supabase
          .from("teams")
          .update({ count: team.count - 1 })
          .eq("id", currentTeam.team_id);

        params.teams = params.teams.filter((t) => t.event_id !== this.event.id);
      }

      if (!isSameTeam) {
        params.teams.push({ event_id: this.event.id, team_id: team.id });
        localStorage.setItem("livewave-params", JSON.stringify(params));

        await supabase
          .from("teams")
          .update({ count: team.count + 1 })
          .eq("id", team.id);
      }
    },
    addLike(id) {
      let message = this.messages.find((msg) => msg.id === id);
      if (!message) return;

      if (this.likedMessages.includes(id)) {
        // Decrement likes and ensure reactivity
        message.likes = (message.likes || 0) - 1;
        this.likedMessages = this.likedMessages.filter((msg) => msg !== id);
      } else {
        if (message.bot) {
          message.likes = (message.likes || 0) + 1;
        } else {
          message.likes = (message.likes || 0) + 1;
          supabase
            .from("messages")
            .update({ likes: message.likes })
            .eq("id", id)
            .then(({ data, error }) => {
              if (error) {
                console.error("Error adding like:", error);
              } else {
                console.log("Like added:", data);
              }
            });
        }
        this.likedMessages.push(id);
      }
    },
    getStyleChatCard() {
      return this.backgroundImage ? `background: rgba(46, 49, 50, 0.7);` : `background: rgba(46, 49, 50, 0.5);`;
    },
    getBackgroundImage() {
      let background = "";
      if (this.backgroundImage) {
        background = `background: url(${this.backgroundImage}) center center fixed; background-size: cover!important;`;
      } else {
        background = `background: url('/backgroundchat${this.themeDark ? "" : "white"}.png') center center fixed;  `;
      }
      return background;
    },
    storeUserInfos() {
      let id = localStorage.getItem("anonymous_id");
      if (!id) {
        id = crypto.randomUUID(); // ou use uuidv4()
        localStorage.setItem("anonymous_id", id);
      }
      let body = {
        generated_id: id,
        infos: {
          userAgentData: navigator.userAgentData,
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
        },
        chat: this.chatId,
        username: this.username,
      };
      supabase
        .from("visitors")
        .insert([body])
        .then(({ data, error }) => {
          if (error) {
            console.error("Error storing user info:", error);
          } else {
            console.log("User info stored:", data);
          }
        });
    },
    setLivers() {
      if (this.enventNow) this.chat.livers = Math.floor(Math.random() * 800) + 200;
    },
    async getEvent() {
      if (!this.chat?.title) return [];
      const { data, error } = await supabase.from("events").select("*").eq("name", this.chat.title).maybeSingle();

      if (data?.id) {
        data.teams = await supabase
          .from("teams")
          .select("*")
          .eq("event", data.id)
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching teams:", error);
            } else {
              return data;
            }
          });
      }

      this.forcebot = data?.forcebot || 0;
      this.event = data;
      if (data?.image) this.$emit("backgroundImage", data?.image || null);
      if (data?.messages) {
        let chatMessages = data?.messages;
        let dateNow = new Date();
        if (dateNow > new Date(data.datestart) && dateNow < new Date(data.dateend)) {
          this.enventNow = true;
        }
        return chatMessages;
      } else return [];
    },

    adMessage() {
      //Every 1 minutes send a message telling "LiveWave à besoin de vous pour continuer à vivre, vous pouvez aider en partageant le lien de la page"
      this.intervals.push(setInterval(() => {
        //send if there is no share message in last 5 messages
        if (this.messages.slice(-15).findIndex((msg) => msg.shareMessage) !== -1) return;
        let msg =
          this.language === "fr"
            ? "LiveWave à besoin de vous pour continuer à exister. <br> Aidez-nous en partageant l'événement :"
            : "LiveWave needs you to continue to exist, <br> you can help by sharing the event :";

        let backgroundsColor = ["#4527A0", "#283593", "#1565C0", "#0277BD", "#00838F", "#00695C", "#2E7D32", "#558B2F"];

        this.messages.push({
          username: "LiveWave",
          content: msg,
          created_at: new Date().toISOString(),
          backgroundColor: backgroundsColor[Math.floor(Math.random() * backgroundsColor.length)],
          shareMessage: true, //to add share buttons
        });
      }, 60000)); //every 1 minute
    },
    sendBotMessage() {
    //   if (!this.enventNow || !this.forcebot) return;
      let paramsForce = [
        { min: 60 * 8, max: 60 * 10 },
        { min: 60 * 3, max: 60 * 5 },
        { min: 60 * 1, max: 60 * 3 },
        { min: 30, max: 60 },
        { min: 10, max: 30 },
        { min: 1, max: 10 },
        { min: 1, max: 5 },
        { min: 1, max: 3 },
        { min: 0.5, max: 1 },
        { min: 0.1, max: 0.5 },
        { min: 0.05, max: 0.1 },
        { min: 0.01, max: 0.05 }
      ];
      if (!paramsForce[this.forcebot - 1]) return;
      let minTimeS = paramsForce[this.forcebot - 1].min;
      let maxTimeS = paramsForce[this.forcebot - 1].max;

      const sendMessage = () => {
        // if (!this.enventNow) return;
        // Only if there is a message with bot true
        if (this.messages.length == 0) return;

        let randomIndex = Math.floor(Math.random() * usernames.length);
        let usernameS = usernames[randomIndex] + Math.floor(Math.random() * 100);

        // Get a random message minus the last 20 messages
        let recentMessages = this.messages.slice(0, -20);
        //let botMessages = this.messages?.filter((msg) => msg.bot && !recentMessages.includes(msg.content));
        //let botMessage = botMessages[Math.floor(Math.random() * botMessages.length)];
        let randomMessage = recentMessages[Math.floor(Math.random() * recentMessages.length)];
        let uuid = crypto.randomUUID();

        if (randomMessage?.content == null) return;
        this.messages.push({
          username: randomMessage?.username || usernameS,
          content: randomMessage?.content,
          created_at: new Date().toISOString(),
          bot: true,
          id: uuid,
        });
      };

      // Send the first message within 3 seconds
      setTimeout(() => {
        this.intervals.push(setInterval(sendMessage, Math.floor(Math.random() * (maxTimeS - minTimeS + 1) + minTimeS) * 1000));
      }, Math.floor(Math.random() * 1000));
    },
    deleteMessagesLoop() {
      if (!this.deleteMessages) return;
      //every 10second deletes messages exist for more than 2 minutes (only in frontend)
      const deleteMessageAfterS = 40;
      this.intervals.push(setInterval(() => {
        let now = new Date();
        this.messages = this.messages.filter((msg) => {
          let date = new Date(msg.created_at);

          return now - date < deleteMessageAfterS * 1000;
        });
      }, 1000));
    },
    async createChat(chatName) {
      const { data, error } = await supabase.from("chats").insert([{ title: chatName }]);
      await this.getRooms();
      let c = this.chats.find((chat) => chat.title === chatName);
      this.$router.push(`/chat/${c.id}`);
      return c;
    },
    async getRooms() {
      const { data, error } = await supabase.from("chats").select("*").order("created_at", { ascending: false });

      this.chats = data;
      trends.sort((a, b) => b.volume - a.volume);
      trends.forEach((trend) => {
        if (!this.chats.find((chat) => chat.title === trend.trend)) {
          let c = this.chats.push({ title: trend.trend, livers: 0 });
        }
      });
    },
    async getMessages(messagesbots) {
      const { data, error } = await supabase.from("messages").select("*").eq("chat_id", this.chatId);

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        this.messages = data;
        let chatMessages = [];

        chatMessages = messagesbots;
        for (let i = 0; i < chatMessages.length; i++) {
          let date5DaysAgo = new Date();
          date5DaysAgo.setDate(date5DaysAgo.getDate() - 5);

          let randomIndex = Math.floor(Math.random() * usernames.length);
          let username = usernames[randomIndex] + Math.floor(Math.random() * 100);

          let randomLike = Math.floor(Math.random() * 10) + 1 == 1 ? 1 : 0;

          let uuid = crypto.randomUUID();

          this.messages.push({
            content: chatMessages[i],
            username: username,
            created_at: date5DaysAgo.toISOString(),
            backgroundColor: null,
            bot: true,
            likes: randomLike,
            id: uuid,
          });
          this.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        this.loading = false;
      }

      this.channel = supabase
        .channel("public:messages")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
          if (payload.new.chat_id !== this.chatId) return;
          this.messages.push(payload.new);
          pulseBackground();
          let chat = document.getElementById("chat-messages-list");
          if (chat) chat.scrollTop = chat.scrollHeight + 20;
        })
        .subscribe();
      return;
    },
    async sendMessage() {
      const toast = useToast();
      if (this.newMessage.length > 200) {
        toast.error(this.$texts[this.language]?.tooLong);
        return;
      }
      if (this.newMessage) {
        // this.newMessage = leoProfanity.clean(this.newMessage);
        this.newMessage = this.cleanMessage(this.newMessage);

        let mess = await supabase.from("messages").insert([
          {
            chat_id: this.chatId,
            username: this.username,
            content: this.newMessage,
            reply: this.answer?.id || null,
          },
        ]);
        this.newMessage = "";
        this.answer = null;
      }
    },
    cleanMessage(msg) {
      msg = leoProfanity.clean(msg);
      //remove urls, emails, and phone numbers, and code
      msg = msg
        .replace(/(https?:\/\/[^\s]+)/g, "***")
        .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "***")
        .replace(/(\+?\d[\d -]{8,12}\d)/g, "***")
        .replace(/`([^`]+)`/g, "***");

      return msg;
    },
    async getChatInfo() {
      let l = await supabase
        .from("chats")
        .select("*")
        .eq("id", this.chatId)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching chat:", error);
          } else {
            this.chat = data[0];
          }
        });
      return;
    },
    addLiver() {
      if (!this.chat) return;
      supabase
        .from("chats")
        .update({ livers: this.chat.livers + 1 })
        .eq("id", this.chatId)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error adding liver:", error);
          } else {
            this.chat.livers++;
          }
        });
    },
    liversLoop() {
      this.intervals.push(setInterval(() => {
        const minutes = new Date().getMinutes();
        const seconds = new Date().getSeconds();
        if (minutes % 2 === 1 && seconds === 2) {
          this.addLiver();
        }
      }, 1000)); // Check every second
    },
  },
};
</script>

<style scoped lang="scss">
.chat-shell {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: clamp(0px, 2.5vh, 28px) clamp(0px, 3vw, 32px);
}

.chat-panel {
  position: relative;
  width: 100%;
  max-width: 860px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  overflow: hidden;
  animation: lw-rise 0.5s ease both;
}

.live-pill :deep(span) {
  color: inherit !important;
  letter-spacing: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--lw-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent);

  .title-caption {
    flex: 1;
    min-width: 0;

    .title {
      font-family: var(--lw-font-display);
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .caption {
      font-size: 13px;
      color: var(--lw-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .header-actions {
    display: flex;
    gap: 6px;
  }

  :deep(.flag) {
    margin: 0 !important;
  }
}

.composer {
  padding: 12px 16px 16px;
  border-top: 1px solid var(--lw-border);
  background: linear-gradient(0deg, rgba(5, 6, 15, 0.4), transparent);
}

.reply-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 8px 8px 14px;
  border-radius: 14px;
  background: rgba(139, 61, 255, 0.12);
  border-left: 3px solid var(--lw-violet);
  font-size: 13px;

  .reply-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--lw-muted);

    strong {
      color: var(--lw-text);
    }
  }

  .icon-btn.small {
    width: 30px;
    height: 30px;
    border-radius: 10px;
  }
}

.composer-input {
  max-width: none !important;
  height: 52px !important;
  background: rgba(255, 255, 255, 0.06) !important;
  box-shadow: 0 0 0 1px var(--lw-border) !important;
  transition: box-shadow 0.2s;

  &:focus-within {
    box-shadow: 0 0 0 1px rgba(139, 61, 255, 0.6), 0 0 0 5px rgba(139, 61, 255, 0.14) !important;
  }

  :deep(input) {
    font-size: 16px !important;
  }

  :deep(button[type="submit"]) {
    width: 40px;
    height: 40px;
    background: var(--lw-gradient) !important;
    box-shadow: 0 6px 20px -6px rgba(139, 61, 255, 0.9);

    &:disabled {
      background: rgba(255, 255, 255, 0.08) !important;
      box-shadow: none;
    }

    svg {
      color: white;
    }
  }
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: var(--lw-gradient);
  cursor: pointer;
  box-shadow: 0 8px 24px -6px rgba(139, 61, 255, 0.8);
  transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.08) rotate(-8deg);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }
}

@media (max-width: 600px) {
  .chat-shell {
    padding: 0;
  }

  .chat-panel {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .chat-header {
    padding: 12px;
    gap: 8px;

    .header-actions .icon-btn:first-child {
      display: none;
    }

    .title-caption .title {
      font-size: 17px;
    }
  }

  .composer {
    padding: 10px 12px calc(12px + env(safe-area-inset-bottom));
  }
}
</style>
