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

<script setup>
import { ref, onMounted } from 'vue'
import { useHead } from '@vueuse/head'

const article = ref({
    title: "LiveWave : révolutionnez l’engagement en direct de votre audience",
    date: "25 mars 2025",
    content: `
      <p>Dans un monde où l'attention est éphémère, <strong>LiveWave</strong> propose une solution innovante pour capter et conserver l'engagement de vos spectateurs en direct.</p>
  
      <h2>Qu’est-ce que LiveWave ?</h2>
      <p>LiveWave est une plateforme interactive qui permet aux spectateurs de commenter et d’échanger en temps réel autour de vos émissions, matchs ou événements en direct.</p>
  
      <h2>Pourquoi utiliser LiveWave ?</h2>
      <ul>
        <li><strong>Interaction centralisée</strong> : Un tchat dédié à chaque émission</li>
        <li><strong>Engagement prolongé</strong> : Vos spectateurs restent plus longtemps, interagissent davantage</li>
        <li><strong>Monétisation intégrée</strong> : Sponsoring, mises en avant, formats publicitaires</li>
      </ul>
  
      <h2>Une alternative aux réseaux sociaux</h2>
      <p>Contrairement aux réseaux sociaux classiques, LiveWave offre un environnement maîtrisé, sans distraction, pour créer une vraie communauté autour de vos programmes.</p>
  
      <h2>Conclusion</h2>
      <p>Avec LiveWave, transformez vos émissions en expériences interactives inoubliables et boostez la fidélité de votre audience.</p>
    `
})

// SEO
useHead({
    title: article.value.title,
    meta: [
        {
            name: 'description', content: 'Découvrez comment LiveWave transforme l\'engagement en direct grâce à une plateforme interactive innovante.'
        },
        { property: 'og:title', content: article.value.title },
        {
            property: 'og:description', content: 'LiveWave permet aux spectateurs d\'échanger en temps réel autour de vos émissions.'
        },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: 'https://tonsite.com/articles/livewave' },
        { property: 'og:image', content: 'https://tonsite.com/images/livewave-cover.jpg' },
    ]
})
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

}

.prose-container{
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