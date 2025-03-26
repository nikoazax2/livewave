import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

// Create a Twitter client with OAuth 1.0a User Context
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY_2,
    appSecret: process.env.TWITTER_API_SECRET_2,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_2,
    accessSecret: process.env.TWITTER_ACCESS_SECRET_2,
});


const messages = [
    "Envie de réagir en direct à ce qui se passe sur BFM ? Rejoins la discussion sur LiveWave ! 📢💬 https://www.livewave.fr/chat/BFM",
    "BFM en direct, ça te fait réagir ? Viens en discuter avec nous sur LiveWave ! 🗣️🔥 https://www.livewave.fr/chat/BFM",
    "Débats, analyses, breaking news… Commente BFM en direct sur LiveWave ! 📰⚡ https://www.livewave.fr/chat/BFM",
    "Marre de juste regarder BFM ? Participe aux discussions en direct sur LiveWave ! 📺💬 https://www.livewave.fr/chat/BFM",
    "Les infos tournent en boucle sur BFM ? Apporte ton avis en direct sur LiveWave ! 🗞️🔴 https://www.livewave.fr/chat/BFM",
    "Un débat qui t’énerve ou t’inspire sur BFM ? Réagis en live avec nous sur LiveWave ! 😡🤯 https://www.livewave.fr/chat/BFM",
    "BFM en direct, ça bouge ! Viens commenter l’actu avec nous sur LiveWave 📢📰 https://www.livewave.fr/chat/BFM",
    "Les breaking news de BFM, ça se vit et ça se commente en direct sur LiveWave ! 🚨💬 https://www.livewave.fr/chat/BFM",
    "Échange sur l’actu en temps réel avec d’autres spectateurs de BFM sur LiveWave ! 🗣️📺 https://www.livewave.fr/chat/BFM",
    "BFM dit quelque chose d’incroyable ? Réagis tout de suite sur LiveWave ! ⚡🔥 https://www.livewave.fr/chat/BFM"
]



// Function to upload an image
async function uploadImage(imagePath) {
    try {
        // Use mimeType instead of type for image
        const mediaId = await twitterClient.v1.uploadMedia(imagePath, { mimeType: 'image/jpeg' });
        return { mediaId };
    } catch (error) {
        console.error("Image upload error:", error.response?.data || error.message);
    }
}

// Function to send a tweet with media
async function tweet(message, mediaId) {
    try {
        const tweetParams = { text: message };
        if (mediaId.mediaId) {
            tweetParams.media = { media_ids: [mediaId.mediaId] };
        }
        await twitterClient.v2.tweet(tweetParams);
        console.log("Tweet sent:", message);
    } catch (error) {
        console.error("Tweet error:", error.response?.data || error.message);
    }
}

// Function to check the time and tweet when an event starts
async function checkAndTweet() {
    //uplaod image
    const mediaId = await uploadImage('./botMarket/image.png');
    // Loop through events
    for (const message of messages) {
        // Tweet the message
        await tweet(message, mediaId);
        //timeout 5MIN  
        await new Promise(resolve => setTimeout(resolve, 300000));
    }
}


async function main() {
    // Run check every minute (or adjust interval as needed)
    console.log("Tweet bot running...");
    checkAndTweet(); // Run immediately
}


main();
