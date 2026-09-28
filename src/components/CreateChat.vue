<template>
  <v-dialog v-model="dialog" max-width="520px">
    <v-card class="pa-2">
      <v-card-title>{{ $texts[language]?.createRoom }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="chatName"
          :label="$texts[language]?.roomName"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-pound"
          hide-details="true"
          autofocus
        />
        <v-textarea
          v-model="chatDescription"
          :label="$texts[language]?.roomDescription"
          variant="outlined"
          rounded="lg"
          rows="3"
          hide-details="true"
          class="mt-4"
        />
      </v-card-text>
      <v-card-actions class="px-6 pb-4">
        <v-spacer></v-spacer>
        <button class="btn-gradient" :disabled="!chatName.trim()" @click="savechatName">
          <v-icon size="18">mdi-plus</v-icon>
          {{ $texts[language]?.confirmText }}
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    title: String,
    language: String,
  },
  data() {
    return {
      dialog: false,
      chatName: "",
      chatDescription: "",
    };
  },
  watch: {
    dialog(open) {
      if (open && !this.chatName) this.chatName = this.title || "";
    },
  },
  methods: {
    savechatName() {
      if (!this.chatName.trim()) return;
      this.$emit("create-chat", this.chatName.trim(), this.chatDescription);
    },
  },
};
</script>
