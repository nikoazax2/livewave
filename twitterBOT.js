import { TwitterApi } from 'twitter-api-v2'; // Utilisation d'un package pour l'API v2
import dotenv from 'dotenv'; // Utilisation d'un package pour les variables d'environnement
const twitterClient = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

const stream = twitterClient.v2.stream('tweets/search/stream', {
    'track': ['#KohLanta', '#PSGOM', '#Tomorrowland'],
});

stream.on(ETwitterStreamEvent.Data, (tweet) => {
    console.log(tweet); // Affiche le tweet filtré
});

stream.on(ETwitterStreamEvent.Error, (error) => {
    console.error('Erreur de flux Twitter:', error);
});
