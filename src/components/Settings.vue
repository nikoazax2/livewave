<template>
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title>Votre pseudo</v-card-title>
            <v-card-text>
                <v-text-field v-model="pseudo" label="Pseudo" outlined></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="dialog = false">Annuler</v-btn>
                <v-btn @click="changePseudo" color="primary">Valider</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'CreateChat',
    props: {
        language:String,
    },
    data() {
        return {
            dialog: true,
            pseudo: ''
        }
    },
    created() {
        this.pseudo = JSON.parse(localStorage.getItem('livewave-params'))?.username
    },
    methods: {
        changePseudo() {
            this.$emit('setUsername', this.pseudo)
        }
    }
}

</script>