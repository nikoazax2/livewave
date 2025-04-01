<template>
    <div class="container">
        <div class="prose-container">
            <article class="prose lg:prose-xl max-w-4xl mx-auto py-10">
                <h1>{{ article.title }}</h1>
                <p class="text-sm text-gray-500">{{ formattedDate }}</p>
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
            article: {},
            formattedDate: ''
        }
    },
    async created() {
        let datas
        try {
            const { data, error } = await supabase
                .from('blog')
                .select('*')
                .eq('keyurl', this.$route.params.id)
            datas = data
        } catch (error) {
            const { data, _ } = await supabase
                .from('blog')
                .select('*')
                .eq('id', this.$route.params.id)
            datas = data
        }
        const data = datas
        if (data && data.length > 0) {
            this.article = data[0]
            this.formattedDate = new Date(this.article.date).toLocaleDateString('fr-FR')

            // ✅ SEO Dynamic Meta Tags
            useHead({
                title: this.article.title + ' | LiveWave',
                meta: [
                    { name: 'description', content: this.article.excerpt || this.article.content.substring(0, 150) },
                    { name: 'keywords', content: 'chat en direct, live chat, ' + this.article.title },
                    { property: 'og:title', content: this.article.title + ' | LiveWave' },
                    { property: 'og:description', content: this.article.excerpt || this.article.content.substring(0, 150) },
                    { property: 'og:type', content: 'article' },
                    { property: 'og:url', content: `https://www.livewave.fr/blog/${this.$route.params.id}` },
                    { property: 'og:image', content: this.article.image || 'https://www.livewave.fr/default-thumbnail.jpg' },
                    { name: 'twitter:card', content: 'summary_large_image' },
                    { name: 'twitter:title', content: this.article.title },
                    { name: 'twitter:description', content: this.article.excerpt || this.article.content.substring(0, 150) },
                    { name: 'twitter:image', content: this.article.image || 'https://www.livewave.fr/default-thumbnail.jpg' }
                ],
                script: [
                    {
                        type: 'application/ld+json',
                        innerHTML: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BlogPosting",
                            "headline": this.article.title,
                            "author": {
                                "@type": "Person",
                                "name": "LiveWave Team"
                            },
                            "publisher": {
                                "@type": "Organization",
                                "name": "LiveWave",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": "https://www.livewave.fr/logo.png"
                                }
                            },
                            "datePublished": this.article.date,
                            "dateModified": this.article.date,
                            "mainEntityOfPage": {
                                "@type": "WebPage",
                                "@id": `https://www.livewave.fr/blog/${this.$route.params.id}`
                            }
                        })
                    }
                ]
            })
        }
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
