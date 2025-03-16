<template>
    <v-dialog v-model="dialog" persistent max-width="600px"> 
        <v-card>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="chatName" label="Créér un salon" required hide-details="true"></v-text-field>
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
    data() {
        return {
            dialog: false,
            chatName: ''
        };
    },
    methods: {
        closeDialog() {
            this.dialog = false;
        },
        savechatName() {
            this.$emit('create-chat', this.chatName);
        }
    }
};
</script>
