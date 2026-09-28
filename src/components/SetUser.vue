<template>
  <v-dialog v-model="dialog" persistent max-width="440px">
    <v-card class="pa-2">
      <v-card-title>{{ $texts[language]?.settings }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="userName"
          label="Pseudo"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-account-outline"
          hide-details="true"
          autofocus
          @keyup.enter="saveUserName"
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="px-6 pb-4">
        <v-spacer></v-spacer>
        <button class="btn-gradient" :disabled="!userName.trim()" @click="saveUserName">
          {{ $texts[language]?.confirmText }}
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    language: String,
    username: String,
  },
  data() {
    return {
      dialog: true,
      userName: "",
    };
  },
  created() {
    this.userName = this.username || "";
  },
  methods: {
    saveUserName() {
      if (!this.userName.trim()) return;
      this.$emit("set-username", this.userName.trim());
    },
  },
};
</script>
