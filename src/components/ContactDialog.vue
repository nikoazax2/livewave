<template>
  <v-dialog v-model="dialog" persistent max-width="600px" @click:outside="$emit('setContact', false)">
    <v-card>
      <v-card-title class="text-h6">Contacte l’équipe LiveWave</v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <p>Une question, une collaboration ou une suggestion ?</p>
              <p>Écris-nous par email ou sur Twitter :</p>
            </v-col>

            <v-col cols="12">
              <v-btn color="primary" block class="mb-2" elevation="0" @click="openEmail"> 📧 Envoyer un email </v-btn> 
              <v-btn color="secondary" block variant="outlined" :href="twitterUrl" target="_blank">
                🐦 Twitter @LiveWaveChat
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
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
      email: "nicolasage38@gmail.com",
    };
  },
  methods: {
    openEmail() {
      window.location.href = "mailto:" + this.email;
    },
  },
};
</script>
