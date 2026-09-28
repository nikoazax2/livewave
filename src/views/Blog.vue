<template>
    <div class="container">
        <article class="prose glass">
            <router-link to="/blogs" class="back"><v-icon size="18">mdi-arrow-left</v-icon> Blog</router-link>
            <p class="date">{{ formattedDate }}</p>
            <h1>{{ article.title }}</h1>
            <img v-if="article.image" :src="article.image" :alt="article.title" class="cover" />
            <div class="body" v-html="article.content"></div>
        </article>
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
        let { data: datas } = await supabase
            .from('blog')
            .select('*')
            .eq('keyurl', this.$route.params.id)
        if (!datas?.length && /^\d+$/.test(this.$route.params.id)) {
            ({ data: datas } = await supabase
                .from('blog')
                .select('*')
                .eq('id', this.$route.params.id))
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

<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: clamp(16px, 5vh, 60px) 16px;
}

.prose {
    max-width: 780px;
    margin: 0 auto;
    padding: clamp(24px, 5vw, 56px);
    border-radius: 28px;
    color: var(--lw-text);
    line-height: 1.75;
    font-size: 17px;
    animation: lw-rise 0.6s ease both;

    .back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--lw-muted);
        font-weight: 600;
        font-size: 14px;
    }

    .date {
        color: var(--lw-muted);
        font-size: 14px;
        margin: 20px 0 6px;
    }

    h1 {
        font-family: var(--lw-font-display);
        font-weight: 700;
        font-size: clamp(30px, 5vw, 48px);
        line-height: 1.1;
        letter-spacing: -0.02em;
        margin: 0 0 24px;
    }

    .cover {
        width: 100%;
        border-radius: 18px;
        margin-bottom: 24px;
    }

    .body :deep(h2) {
        font-family: var(--lw-font-display);
        font-size: 26px;
        margin: 36px 0 12px;
    }

    .body :deep(a) {
        color: #b89bff;
        text-decoration: underline;
    }

    .body :deep(iframe) {
        border-radius: 14px;
        margin: 10px 0;
        max-width: 100%;
    }
}
</style>
