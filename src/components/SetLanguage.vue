<template>
    <div class="ml-2 flag align-center d-flex" style="cursor: pointer;">
        <img v-if="language === 'en'" src="../assets/flags/en.png" width="24" height="24" @click="$emit('setLanguage', 'fr')" />
        <img v-else-if="language === 'fr'" src="../assets/flags/fr.png" width="24" height="24" @click="$emit('setLanguage', 'es')" />
        <img v-else-if="language === 'es'" src="../assets/flags/es.png" width="24" height="24" @click="$emit('setLanguage', 'de')" />
        <img v-else-if="language === 'de'" src="../assets/flags/de.png" width="24" height="24" @click="$emit('setLanguage', 'en')" />
    </div>
</template>

<script>
export default {
    name: 'SetLanguage',
    props: {
        language: {
            type: String,
            default: 'en'
        }
    },
}
</script>

<style lang="scss" scoped>
.flag {
    border-radius: 5px;
    overflow: hidden;
}
</style>