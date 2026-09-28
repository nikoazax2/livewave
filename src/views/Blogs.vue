<template>
    <div class="container">
        <header class="head">
            <router-link to="/" class="back"><v-icon size="18">mdi-arrow-left</v-icon> LiveWave</router-link>
            <h1>Le <span class="gradient-text">blog</span></h1>
        </header>
        <div class="articles">
            <button class="article glass" v-for="(article, index) in articles" :key="article.id"
                :style="{ animationDelay: `${index * 60}ms` }" @click="goToArticle(article.keyurl || article.id)">
                <div v-if="article.image" class="thumb" :style="{ backgroundImage: `url(${article.image})` }"></div>
                <div v-else class="thumb placeholder"><v-icon size="36">mdi-waveform</v-icon></div>
                <div class="info">
                    <span class="date">{{ article.date }}</span>
                    <h2>{{ article.title }}</h2>
                    <p v-if="article.excerpt">{{ article.excerpt }}</p>
                </div>
            </button>
        </div>
    </div>
</template>

<script>
import { supabase } from '../supabase'
export default {
    name: 'Blogs',
    data() {
        return {
            articles: []
        }
    },
    async created() {
        const { data, error } = await supabase
            .from('blog')
            .select('*')
        // {
        //     "id": 1,
        //         "created_at": "2025-03-26T23:02:23.555115+00:00",
        //             "content": "<p>Dans un monde où l'attention est éphémère, <strong>LiveWave</strong> propose une solution innovante pour capter et conserver l'engagement de vos spectateurs en direct.</p>\n  \n      <h2>Qu’est-ce que LiveWave ?</h2>\n      <p>LiveWave est une plateforme interactive qui permet aux spectateurs de commenter et d’échanger en temps réel autour de vos émissions, matchs ou événements en direct.</p>\n  \n      <h2>Pourquoi utiliser LiveWave ?</h2>\n      <ul>\n        <li><strong>Interaction centralisée</strong> : Un tchat dédié à chaque émission</li>\n        <li><strong>Engagement prolongé</strong> : Vos spectateurs restent plus longtemps, interagissent davantage</li>\n        <li><strong>Monétisation intégrée</strong> : Sponsoring, mises en avant, formats publicitaires</li>\n      </ul>\n  \n      <h2>Une alternative aux réseaux sociaux</h2>\n      <p>Contrairement aux réseaux sociaux classiques, LiveWave offre un environnement maîtrisé, sans distraction, pour créer une vraie communauté autour de vos programmes.</p>\n  \n      <h2>Conclusion</h2>\n      <p>Avec LiveWave, transformez vos émissions en expériences interactives inoubliables et boostez la fidélité de votre audience.</p>",
        //                 "title": "LiveWave : révolutionnez l’engagement en direct de votre audience",
        //                     "meta": "[                 {                     name: 'description',                     content: 'Découvrez comment LiveWave transforme l\\'engagement en direct grâce à une plateforme interactive innovante.'                 },                 { property: 'og:title', content: this.article.title },                 {                     property: 'og:description',                     content: 'LiveWave permet aux spectateurs d\\'échanger en temps réel autour de vos émissions.'                 },                 { property: 'og:type', content: 'article' },                 { property: 'og:url', content: 'https://tonsite.com/articles/livewave' },                 { property: 'og:image', content: 'https://tonsite.com/images/livewave-cover.jpg' },             ]",
        //                         "date": "2025-05-23T00:00:00"
        // }
        this.articles = data || []
        this.articles.forEach(article => {
            article.date = new Date(article.date).toLocaleDateString('fr-FR')
        })

    },
    methods: {
        goToArticle(id) {
            this.$router.push({ name: 'Blog', params: { id } })
        }
    }
} 
</script>
 
<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: clamp(16px, 5vh, 56px) clamp(16px, 4vw, 48px);
}

.head {
    max-width: 1100px;
    margin: 0 auto 28px;

    .back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--lw-muted);
        font-weight: 600;
        font-size: 14px;
    }

    h1 {
        font-family: var(--lw-font-display);
        font-size: clamp(36px, 6vw, 60px);
        letter-spacing: -0.03em;
        margin: 12px 0 0;
    }
}

.articles {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
}

.article {
    text-align: left;
    color: var(--lw-text);
    font-family: inherit;
    border-radius: 22px;
    overflow: hidden;
    padding: 0;
    cursor: pointer;
    transition: transform 0.25s, border-color 0.25s;
    animation: lw-rise 0.5s ease both;

    &:hover {
        transform: translateY(-4px);
        border-color: rgba(139, 61, 255, 0.45);
    }

    .thumb {
        height: 160px;
        background-size: cover;
        background-position: center;

        &.placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(77, 124, 255, 0.35), rgba(255, 61, 139, 0.3));
        }
    }

    .info {
        padding: 18px 20px 22px;
    }

    .date {
        font-size: 13px;
        color: var(--lw-muted);
    }

    h2 {
        font-family: var(--lw-font-display);
        font-size: 19px;
        line-height: 1.25;
        margin: 6px 0 8px;
    }

    p {
        color: var(--lw-muted);
        font-size: 14px;
        margin: 0;
    }
}
</style>
