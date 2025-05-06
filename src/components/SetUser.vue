<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="userName" label="User name" required hide-details="true"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="saveUserName">
                    {{ $texts[language]?.confirmText }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        language: String
    },
    data() {
        return {
            dialog: true,
            userName: ''
        };
    },
    created() {
        this.userName = this.username || '';
    },
    methods: {
        closeDialog() {
            this.dialog = false;
        },
        saveUserName() {
            this.$emit('set-username', this.userName);
        }
    }
};
</script>
