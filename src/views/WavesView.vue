<template>
  <div class="waves">
    <CreateChat @create-chat="createChat" ref="createChat" :title="search" :language="language" />

    <header class="topbar">
      <img src="../../public/logobigwhite.png" height="34" alt="LiveWave" class="logo" />
      <div class="actions">
        <button class="icon-btn" :aria-label="$texts[language]?.contact" @click="$emit('setContact', true)">
          <v-icon>mdi-email-heart-outline</v-icon>
        </button>
        <button class="icon-btn" :aria-label="$texts[language]?.settings" @click="$emit('setaskUsername', true)">
          <v-icon>mdi-account-cog-outline</v-icon>
        </button>
        <div class="icon-btn" :aria-label="$texts[language]?.language">
          <SetLanguage @setLanguage="$emit('setLanguage', $event)" :language="language" />
        </div>
      </div>
    </header>

    <main class="scroller">
      <section class="hero">
        <div class="meteors"><Meteors :count="14" /></div>

        <div class="hero-text">
          <span class="live-pill"><span class="dot"></span>{{ $texts[language]?.heroTag }}</span>
          <h1>
            {{ $texts[language]?.heroLead }}
            <FlipWords :key="language" :words="$texts[language]?.flipWords || []" :duration="2600" class="flip" />
            <br />
            <span class="gradient-text">{{ $texts[language]?.heroTitle2 }}</span>
          </h1>
          <p class="subtitle">{{ $texts[language]?.heroSubtitle }}</p>

          <div class="search glass">
            <v-icon class="search-icon">mdi-magnify</v-icon>
            <input
              v-model="search"
              type="search"
              :placeholder="$texts[language]?.search"
              :aria-label="$texts[language]?.search"
              @keyup.enter="onEnter"
            />
            <BorderBeam :size="140" :duration="9000" color-from="#4d7cff" color-to="#ff3d8b" :border-width="1.5" />
          </div>

          <div class="hero-cta">
            <ShimmerButton
              class="shimmer"
              background="linear-gradient(120deg, #4d7cff, #8b3dff 55%, #ff3d8b)"
              shimmer-color="#ffffff"
              @click="$refs.createChat.dialog = true"
            >
              <span class="shimmer-label"><v-icon size="18">mdi-plus</v-icon>{{ $texts[language]?.createRoom }}</span>
            </ShimmerButton>
            <div v-if="onlineCount > 0" class="online">
              <NumberTicker :value="onlineCount" :decimal-places="0" :duration="1800" class="online-count" />
              <span>{{ $texts[language]?.worldwide }}</span>
            </div>
          </div>
        </div>

        <div class="hero-globe" aria-hidden="true">
          <div class="globe-glow"></div>
          <Globe :config="globeConfig" />
        </div>
      </section>

      <section v-if="marqueeRooms.length" class="marquee-wrap">
        <Marquee pause-on-hover :repeat="3" class="marquee">
          <button v-for="chat in marqueeRooms" :key="chat.title" class="chip" @click="clickRoom(chat)">
            <span class="chip-dot" :style="{ background: accent(chat.title) }"></span>#{{ chat.title.replace(/^#/, "") }}
          </button>
        </Marquee>
      </section>

      <section v-if="featured.length && !search" class="rooms">
        <h2 class="section-title"><v-icon size="20" class="mr-2">mdi-lightning-bolt</v-icon>{{ $texts[language]?.featured }}</h2>
        <div class="featured">
          <CardContainer v-for="chat in featured" :key="chat.id || chat.title" container-class="featured-container" class="featured-inner">
            <CardBody class="featured-card" @click="clickRoom(chat)">
              <CardItem :translate-z="20" class="featured-bg" :style="{ background: accent(chat.title) }"></CardItem>
              <CardItem :translate-z="60" class="featured-avatar">{{ initials(chat.title) }}</CardItem>
              <CardItem :translate-z="50" as="h3" class="featured-title">{{ chat.title }}</CardItem>
              <CardItem v-if="chat.description" :translate-z="40" as="p" class="featured-desc">{{ chat.description }}</CardItem>
              <div class="featured-footer">
                <CardItem :translate-z="30">
                  <span v-if="chat.livers > 0" class="live-pill"><span class="dot"></span>{{ chat.livers }} {{ $texts[language]?.live }}</span>
                </CardItem>
                <CardItem :translate-z="70" as="span" class="join">
                  {{ $texts[language]?.join }} <v-icon size="16">mdi-arrow-right</v-icon>
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
        </div>
      </section>

      <section class="rooms">
        <h2 class="section-title"><v-icon size="20" class="mr-2">mdi-fire</v-icon>{{ $texts[language]?.trending }}</h2>

        <div class="grid">
          <button v-if="search.length > 0 && !exactMatch" class="create-card" @click="$refs.createChat.dialog = true">
            <div class="room-avatar create-avatar"><v-icon>mdi-plus</v-icon></div>
            <div class="room-body">
              <strong>{{ $texts[language]?.dontExist.title }}</strong>
              <span class="room-desc">{{ $texts[language]?.dontExist.description }}</span>
            </div>
          </button>

          <CardSpotlight
            v-for="(chat, index) in gridRooms"
            :key="chat.id || chat.title"
            class="room-card"
            slot-class="room-slot"
            gradient-color="#8b3dff"
            :gradient-opacity="0.22"
            :gradient-size="220"
            :style="{ animationDelay: `${Math.min(index, 20) * 35}ms` }"
            role="button"
            tabindex="0"
            @click="clickRoom(chat)"
            @keyup.enter="clickRoom(chat)"
          >
            <div class="room-avatar" :style="{ background: accent(chat.title) }">{{ initials(chat.title) }}</div>
            <div class="room-body">
              <strong>{{ chat.title }}</strong>
              <span v-if="chat.description" class="room-desc">{{ chat.description }}</span>
            </div>
            <span v-if="chat?.livers > 0" class="live-pill"><span class="dot"></span>{{ chat.livers }}</span>
            <v-icon v-else class="room-arrow">mdi-arrow-top-right</v-icon>
          </CardSpotlight>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { supabase } from "../supabase";
import CreateChat from "../components/CreateChat.vue";
import trends from "../../public/trends.json";
import SetLanguage from "../components/SetLanguage.vue";
import { FlipWords } from "../components/inspira/flip-words";
import { BorderBeam } from "../components/inspira/border-beam";
import { ShimmerButton } from "../components/inspira/shimmer-button";
import { NumberTicker } from "../components/inspira/number-ticker";
import { Globe } from "../components/inspira/globe";
import { Marquee } from "../components/inspira/marquee";
import { Meteors } from "../components/inspira/meteors";
import { CardSpotlight } from "../components/inspira/card-spotlight";
import { CardContainer, CardBody, CardItem } from "../components/inspira/card-3d";

export default {
  name: "waves",
  components: {
    CreateChat,
    SetLanguage,
    FlipWords,
    BorderBeam,
    ShimmerButton,
    NumberTicker,
    Globe,
    Marquee,
    Meteors,
    CardSpotlight,
    CardContainer,
    CardBody,
    CardItem,
  },
  props: {
    bots: Boolean,
    language: String,
    themeDark: Boolean,
  },
  data() {
    return {
      chats: [],
      search: "",
      globeConfig: {
        width: 800,
        height: 800,
        devicePixelRatio: 2,
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 5,
        baseColor: [0.22, 0.2, 0.45],
        markerColor: [1, 0.24, 0.55],
        glowColor: [0.45, 0.25, 1],
        markers: [
          { location: [48.8566, 2.3522], size: 0.09 },
          { location: [40.7128, -74.006], size: 0.1 },
          { location: [51.5072, -0.1276], size: 0.07 },
          { location: [40.4168, -3.7038], size: 0.06 },
          { location: [52.52, 13.405], size: 0.06 },
          { location: [-23.5505, -46.6333], size: 0.08 },
          { location: [35.6762, 139.6503], size: 0.07 },
          { location: [34.0522, -118.2437], size: 0.07 },
          { location: [6.5244, 3.3792], size: 0.05 },
          { location: [45.5017, -73.5673], size: 0.05 },
          { location: [33.5731, -7.5898], size: 0.05 },
          { location: [-33.8688, 151.2093], size: 0.05 },
        ],
      },
    };
  },
  computed: {
    roomsBySearch() {
      return this.chats
        ?.filter(
          (chat) =>
            chat.title.toLowerCase().includes(this.search.toLowerCase()) ||
            chat.description?.toLowerCase().includes(this.search.toLowerCase())
        )
        .sort((a, b) => (b.livers || 0) - (a.livers || 0));
    },
    exactMatch() {
      return this.chats?.some((chat) => chat.title.toLowerCase().includes(this.search.toLowerCase()));
    },
    featured() {
      return this.roomsBySearch.slice(0, 3);
    },
    gridRooms() {
      return this.search ? this.roomsBySearch : this.roomsBySearch.slice(3);
    },
    marqueeRooms() {
      return this.chats.slice(0, 16);
    },
    onlineCount() {
      return this.chats.reduce((sum, chat) => sum + (chat.livers || 0), 0);
    },
  },
  methods: {
    accent(title = "") {
      let hash = 0;
      for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
      const h = Math.abs(hash) % 360;
      return `linear-gradient(135deg, hsl(${h} 90% 60%), hsl(${(h + 60) % 360} 90% 55%))`;
    },
    initials(title = "") {
      const clean = title.replace(/[^\p{L}\p{N} ]/gu, "").trim();
      const words = clean.split(/\s+/).filter(Boolean);
      const letters = words.length > 1 ? words[0][0] + words[1][0] : clean.slice(0, 2);
      return letters.toUpperCase() || "LW";
    },
    onEnter() {
      if (this.roomsBySearch.length) this.clickRoom(this.roomsBySearch[0]);
      else this.$refs.createChat.dialog = true;
    },
    async clickRoom(chat) {
      if (chat.id) this.$router.push(`/chat/${chat.id}`);
      else {
        chat = await this.createChat(chat.title);
        this.$router.push(`/chat/${chat.id}`);
      }
    },
    async getRooms() {
      const { data, error } = await supabase.from("chats").select("*").order("created_at", { ascending: false });
      if (error) this.$toast.error(error.message);
      else {
        this.chats = data;
        trends.sort((a, b) => b.volume - a.volume);
        trends.forEach((trend) => {
          if (!this.chats.find((chat) => chat.title === trend.trend)) {
            this.chats.push({ title: trend.trend, livers: 0 });
          }
        });
      }
    },
    async createChat(chatName, chatDescription) {
      await supabase.from("chats").insert([{ title: chatName, description: chatDescription }]);
      this.$refs.createChat.dialog = false;

      await this.getRooms();
      let c = this.chats.find((chat) => chat.title === chatName);
      this.$router.push(`/chat/${c.id}`);
      return c;
    },
  },
  mounted() {
    this.getRooms();
  },
};
</script>

<style scoped lang="scss">
.waves {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px clamp(16px, 4vw, 48px);

  .logo {
    filter: drop-shadow(0 0 18px rgba(139, 61, 255, 0.5));
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  :deep(.flag) {
    margin: 0 !important;
  }
}

.scroller {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 clamp(16px, 4vw, 48px) 60px;
}

.hero {
  position: relative;
  max-width: 1200px;
  margin: clamp(10px, 4vh, 50px) auto 24px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 24px;
}

.meteors {
  position: absolute;
  inset: -40px 0 0 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.6;
}

.hero-text {
  position: relative;
  z-index: 1;
  animation: lw-rise 0.7s ease both;

  h1 {
    font-family: var(--lw-font-display);
    font-size: clamp(34px, 5.4vw, 68px);
    line-height: 1.04;
    letter-spacing: -0.03em;
    font-weight: 700;
    margin: 18px 0 16px;
  }

  :deep(.flip) {
    padding: 0 !important;
    color: #c9b6ff !important;
  }

  .subtitle {
    color: var(--lw-muted);
    font-size: clamp(15px, 1.6vw, 18px);
    max-width: 520px;
    margin: 0 0 28px;
  }
}

.search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  padding: 14px 20px;
  max-width: 540px;

  &:focus-within {
    border-color: rgba(139, 61, 255, 0.6);
    box-shadow: 0 0 0 4px rgba(139, 61, 255, 0.15);
  }

  .search-icon {
    color: var(--lw-muted);
  }

  input {
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    outline: none;
    color: var(--lw-text);
    font-size: 16px;
    font-family: inherit;

    &::placeholder {
      color: var(--lw-muted);
    }
  }
}

.hero-cta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 22px;

  .shimmer {
    font-family: var(--lw-font-display);
    font-weight: 600;
    box-shadow: 0 12px 36px -10px rgba(139, 61, 255, 0.8);
  }

  .shimmer-label {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: white;
  }

  .online {
    display: flex;
    align-items: baseline;
    gap: 8px;
    color: var(--lw-muted);
    font-size: 14px;

    .online-count {
      font-family: var(--lw-font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--lw-text) !important;
    }
  }
}

.hero-globe {
  position: relative;
  width: 100%;
  max-width: 540px;
  aspect-ratio: 1;
  justify-self: center;
  animation: lw-rise 1s ease 0.2s both;

  .globe-glow {
    position: absolute;
    inset: 12%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139, 61, 255, 0.45), rgba(77, 124, 255, 0.1) 55%, transparent 70%);
    filter: blur(40px);
  }
}

.marquee-wrap {
  max-width: 1200px;
  margin: 0 auto 36px;
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid var(--lw-border);
    background: rgba(255, 255, 255, 0.04);
    color: var(--lw-text);
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;

    &:hover {
      background: rgba(139, 61, 255, 0.18);
      border-color: rgba(139, 61, 255, 0.5);
    }
  }

  .chip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}

.rooms {
  max-width: 1200px;
  margin: 0 auto 36px;
}

.section-title {
  font-family: var(--lw-font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--lw-muted);
  margin: 0 0 16px 4px;
  display: flex;
  align-items: center;
}

.featured {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;

  :deep(.featured-container) {
    padding: 0;
  }

  :deep(.featured-inner) {
    width: 100%;
  }
}

:deep(.featured-card) {
  position: relative;
  width: 100% !important;
  height: auto !important;
  min-height: 230px;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid var(--lw-border);
  background: var(--lw-surface);
  backdrop-filter: blur(20px);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  transition: box-shadow 0.3s, border-color 0.3s;

  &:hover {
    border-color: rgba(139, 61, 255, 0.5);
    box-shadow: 0 30px 60px -20px rgba(139, 61, 255, 0.55);
  }
}

:deep(.featured-bg) {
  position: absolute;
  top: -40%;
  right: -30%;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  opacity: 0.35;
  filter: blur(40px);
}

:deep(.featured-avatar) {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--lw-font-display);
  font-weight: 700;
  font-size: 18px;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--lw-border-strong);
  backdrop-filter: blur(8px);
}

:deep(.featured-title) {
  font-family: var(--lw-font-display);
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 0;
  line-height: 1.15;
}

:deep(.featured-desc) {
  color: var(--lw-muted);
  font-size: 14px;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.join) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  border-radius: 999px;
  background: white;
  color: #0b0b1a;
  font-weight: 700;
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

:deep(.room-card) {
  height: auto !important;
  border-radius: 18px !important;
  border: 1px solid var(--lw-border) !important;
  background: var(--lw-surface) !important;
  color: var(--lw-text) !important;
  backdrop-filter: blur(18px);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
  animation: lw-rise 0.5s ease both;

  &:hover {
    border-color: rgba(139, 61, 255, 0.45) !important;
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--lw-violet);
    outline-offset: 2px;
  }
}

:deep(.room-slot) {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px;
}

.create-card {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  text-align: left;
  color: var(--lw-text);
  font-family: inherit;
  border-radius: 18px;
  border: 1px dashed var(--lw-border-strong);
  background: var(--lw-surface);
  cursor: pointer;
}

.room-avatar {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--lw-font-display);
  font-weight: 700;
  font-size: 16px;
  color: white;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.5);
}

.create-avatar {
  background: rgba(255, 255, 255, 0.08);
}

.room-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  text-align: left;

  strong {
    font-family: var(--lw-font-display);
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .room-desc {
    font-size: 13px;
    color: var(--lw-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.room-arrow {
  color: var(--lw-muted);
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
}

:deep(.room-card:hover) .room-arrow {
  opacity: 1;
  transform: translate(2px, -2px);
}

@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;

    .subtitle,
    .search {
      margin-left: auto;
      margin-right: auto;
    }

    .hero-cta {
      justify-content: center;
    }
  }

  .hero-globe {
    max-width: 340px;
    margin-top: -10px;
  }

  .featured {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .hero-globe {
    max-width: 280px;
  }
}
</style>
