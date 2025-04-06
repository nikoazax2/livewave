<template>
    <div class="d-flex align-center">
        <!-- <div class="red-circle mr-3" /> -->
        <v-icon size="20" color="red" class="mr-2 cligne"> mdi-account </v-icon>
        {{ livers }}
    </div>
</template>

<script>
export default {
    props: {
        livers: {
            type: Number,
            required: true
        }
    }
};
</script>

<style scoped lang="scss">
@keyframes fadeBlink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.2;
    }
}

.cligne {
    animation: fadeBlink 1.5s infinite;
}

.red-circle {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: red;
    margin-right: 5px;
    animation: fadeBlink 2s infinite;
}
</style>