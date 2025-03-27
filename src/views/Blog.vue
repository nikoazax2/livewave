<template>
    <div class="container">
        <div class="prose-container">
            <article class="prose lg:prose-xl max-w-4xl mx-auto py-10">
                <h1>{{ article.title }}</h1>
                <p class="text-sm text-gray-500">{{ article.date }}</p>
                <div v-html="article.content"></div>
            </article>
        </div>
    </div>
</template>

<script>
import { useHead } from '@vueuse/head'
import { supabase } from '../supabase'

export default {
    name: 'Blog',
    data() {
        return {
            article: {}
        }
    },
    async created() {
        const { data, error } = await supabase
            .from('blog')
            .select('*')
            .eq('id', this.$route.params.id)
        this.article = data[0]
        this.article.date = new Date(this.article.date).toLocaleDateString('fr-FR')
    }
} 
</script>

<style lang="scss">
h2 {
    margin: 30px 0 !important;
    font-size: 35px;
}
</style>

<style scoped lang="scss">
.container {
    background: url('../assets/backgroundchat.png') center center fixed;
    background-size: 100px 100px;
    width: 100%;
    height: 100vh;

    display: flex;
    justify-content: center;

    overflow-y: auto;

    padding: 0 20px;

}

.prose-container {
    overflow-y: auto;
    width: 100%;

}

.prose {
    max-width: 800px;
    width: 100%;
    height: fit-content;
    color: white;

    h1 {
        font-weight: 400;
        font-size: 48px;
        margin-bottom: 20px;
    }
}
</style>