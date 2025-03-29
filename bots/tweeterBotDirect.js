import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

// Create a Twitter client with OAuth 1.0a User Context
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
const twitterClient2 = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY_2,
    appSecret: process.env.TWITTER_API_SECRET_2,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_2,
    accessSecret: process.env.TWITTER_ACCESS_SECRET_2,
});



const messages = [
     "Un plat qui te donne faim ou une catastrophe culinaire ? Partage tes réactions en direct ! https://www.livewave.fr/chat/TOPCHEF #TopChef",
    "Et toi, t’aurais validé cette assiette ? Dis-nous tout en live ! 🍽️ https://www.livewave.fr/chat/TOPCHEF #TopChef",
    "💬 Débrief des assiettes en direct ! Qui va briller ce soir ? Viens réagir sur https://www.livewave.fr/chat/TOPCHEF #TopChef",
    "🔥 Clutch ou flop ? Réagis en direct aux épreuves sur LiveWave : https://www.livewave.fr/chat/TOPCHEF #TopChef",
    "Coup de cœur ou incompréhension ? Viens donner ton avis sur les plats de ce soir sur LiveWave 🍽️ https://www.livewave.fr/chat/TOPCHEF #TopChef"
]




// Function to upload an image
async function uploadImage(imagePath) {
    try {
        // Use mimeType instead of type for image
        const mediaId = await twitterClient.v1.uploadMedia(imagePath, { mimeType: 'image/jpeg' });
        const mediaId_2 = await twitterClient2.v1.uploadMedia(imagePath, { mimeType: 'image/jpeg' });
        return { mediaId, mediaId_2 };
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

        const tweetParams_2 = { text: message };
        if (mediaId.mediaId_2) {
            tweetParams_2.media = { media_ids: [mediaId.mediaId_2] };
        }
        await twitterClient2.v2.tweet(tweetParams_2);

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
        //timeout 7 minutes
        await new Promise(resolve => setTimeout(resolve, 420000));
    }
}


async function main() {
    // Run check every minute (or adjust interval as needed)
    console.log("Tweet bot running...");
    checkAndTweet(); // Run immediately
}


main();
