<template>
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-text>
                <v-container>
                    <h2 class="mb-4">
                        Bienvenue sur LiveWave {{ username }}!
                    </h2>
                    <p class="mb-0">
                        LiveWave est une application de conversation en temps réel autour des événements qui vous passionnent !
                    </p>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog=false">Valider</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: { username : String },
    data() {
        return {
            dialog: true,
        };
    }
};
</script>
