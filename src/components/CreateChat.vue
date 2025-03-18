<template>
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="chatName" :label="texts[language]?.roomName" required hide-details="true" />
                            <v-textarea v-model="chatDescription" :label="texts[language]?.roomDescription" required hide-details="true" class="mt-4" />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="savechatName">
                    {{ texts[language]?.confirmText }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        title: String,
        language: String
    },
    data() {
        return {
            dialog: false,
            chatName: '',
            chatDescription: '',
            texts: {
                en: {
                    roomName: 'Room name',
                    roomDescription: 'Describe your room here',
                    confirmText: 'Confirm'
                },
                fr: {
                    roomName: 'Nom de la salle',
                    roomDescription: 'Décris ta salle ici',
                    confirmText: 'Valider'
                }
            }
        };
    },
    created() {
        this.chatName = this.title || '';
    },
    methods: {
        closeDialog() {
            this.dialog = false;
        },
        savechatName() {
            this.$emit('create-chat', this.chatName, this.chatDescription);
        }
    }
};
</script>
