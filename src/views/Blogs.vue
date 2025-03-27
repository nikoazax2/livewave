<template>
    <div class="container">
       <div class="articles">
            <div class="article" v-for="article in articles" :key="article.id" @click="goToArticle(article.id)">
                <h2>{{ article.title }}</h2>
                <p>{{ article.date }}</p> 
            </div>
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
        this.articles = data
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
 
<style lang="scss">
iframe {
    border-radius: 10px;
    margin: 10px 0;     
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

    padding: 20px 20px;

}
.articles {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;

    .article {
        margin: 1rem;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0.699);
        width: 300px;
        height: 300px;
        
        &:hover {
            transition: all 0.3s;
            background-color: #f9f9f96b;
            transform: scale(1.02);
            cursor: pointer;
        }
        
        h2 {
            margin: 0;
            font-size: 1.2rem;
        }
    }
}
</style>