<template>
    <v-dialog v-model="dialog"   max-width="600px">
        <v-card>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="chatName" label="Nom de ton salon" required
                                hide-details="true"></v-text-field>
                            <v-textarea v-model="chatDescription" label="Décris ici le sujet de ton salon" required hide-details="true"
                                class="mt-4"></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="savechatName">Valider</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        title : String,
    },
    data() {
        return {
            dialog: false,
            chatName: '',
            chatDescription: ''
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
