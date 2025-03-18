<template>
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-text>
                <v-container>
                    <h2 class="mb-4">
                        {{ languageTexts.welcomeMessage }} {{ username }}!
                    </h2>
                    <p class="mb-0">
                        {{ languageTexts.description }}
                    </p>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">
                    {{ languageTexts.confirmText }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        username: String,
        language: String
    },
    data() {
        return {
            dialog: true,
            texts: {
                en: {
                    welcomeMessage: 'Welcome to LiveWave',
                    description: 'LiveWave is a real-time conversation app around the events you love!',
                    confirmText: 'Confirm'
                },
                fr: {
                    welcomeMessage: 'Bienvenue sur LiveWave',
                    description: 'LiveWave est une application de conversation en temps réel autour des événements qui vous passionnent !',
                    confirmText: 'Valider'
                }
            }
        };
    },
    computed: {
        languageTexts() {
            return this.texts[this.language] || this.texts.en;
        }
    }
};
</script>