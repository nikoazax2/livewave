<template>
  <v-dialog v-model="dialog" max-width="480px" @click:outside="$emit('setContact', false)" @keydown.esc="$emit('setContact', false)">
    <v-card class="pa-2 contact">
      <v-card-title class="d-flex align-center">
        <span>Contacte l'équipe LiveWave</span>
        <v-spacer></v-spacer>
        <button class="icon-btn" aria-label="close" @click="$emit('setContact', false)"><v-icon>mdi-close</v-icon></button>
      </v-card-title>

      <v-card-text>
        <p>Une question, une collaboration ou une suggestion ?</p>
        <p>Contacte-nous pour créer un chat dédié à ta communauté, ton événement ou ton entreprise.</p>

        <button class="btn-gradient w-100 justify-center mt-4" @click="openEmail">
          <v-icon size="18">mdi-email-outline</v-icon> Envoyer un email
        </button>
        <p class="text-center mt-2 email">{{ email }}</p>
        <a class="social-link" :href="twitterUrl" target="_blank" rel="noopener">
          <v-icon size="18">mdi-twitter</v-icon> @LiveWaveChat
        </a>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    language: String,
  },
  data() {
    return {
      dialog: true,
      twitterUrl: "https://x.com/LiveWaveChat",
      email: "contact.livewave@gmail.com",
    };
  },
  methods: {
    openEmail() {
      window.location.href = "mailto:" + this.email;
    },
  },
};
</script>

<style scoped lang="scss">
.contact {
  p {
    color: var(--lw-muted);
    margin-bottom: 6px;
  }

  .email {
    font-size: 13px;
  }

  .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
    padding: 11px;
    border-radius: 999px;
    border: 1px solid var(--lw-border-strong);
    font-weight: 600;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }
}
</style>
