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

// List of events with multiple dates/times (Paris time)
const events = [
    // { hashtag: "#KohLanta", dates: ["2025-03-21T18:35", "2025-03-28T20:50"], image: 'kohlanta.png' },
    // { hashtag: "#IDLT", dates: ["2025-03-21T21:10", "2025-03-28T21:10"], image: 'idlt.png' } 
    { hashtag: "#RWANGA", dates: ["2025-03-21T18:35", "2025-03-28T20:50"], image: 'rwanga.png' },
];

const messages = [
    "C'est le grand départ pour EVENT_NAME ! Rejoins-nous sur le tchat en direct : https://www.livewave.fr/chat/EVENT_NAME_URL",
    "Ça commence maintenant ! Venez discuter en direct de EVENT_NAME : https://www.livewave.fr/chat/EVENT_NAME_URL",
    "Prêt pour l'aventure ? EVENT_NAME débute maintenant ! Suivez-nous en direct : https://www.livewave.fr/chat/EVENT_NAME_URL",
    "C'est parti pour EVENT_NAME ! Le tchat est ouvert : https://www.livewave.fr/chat/EVENT_NAME_URL",
    "Le moment tant attendu est arrivé ! Rejoins-nous pour EVENT_NAME sur le tchat en direct : https://www.livewave.fr/chat/EVENT_NAME_URL",
    "Ne manquez pas l'événement ! EVENT_NAME commence maintenant, viens discuter avec nous en direct : https://www.livewave.fr/chat/EVENT_NAME_URL",
    "C'est maintenant ou jamais pour EVENT_NAME ! Rends-toi sur le tchat : https://www.livewave.fr/chat/EVENT_NAME_URL",
    "Tous à vos claviers ! Le tchat pour EVENT_NAME est ouvert : https://www.livewave.fr/chat/EVENT_NAME_URL",
    "Un nouvel événement commence ! Rejoins-nous pour EVENT_NAME en direct : https://www.livewave.fr/chat/EVENT_NAME_URL",
    "L'événement EVENT_NAME est lancé ! Venez discuter en live : https://www.livewave.fr/chat/EVENT_NAME_URL"
];

// Function to upload an image
async function uploadImage(imagePath) {
    try {
        // Use mimeType instead of type for image
        const mediaId = await twitterClient.v1.uploadMedia(imagePath, { mimeType: 'image/jpeg' });
        return mediaId;
    } catch (error) {
        console.error("Image upload error:", error.response?.data || error.message);
    }
}

// Function to send a tweet with media
async function tweet(message, mediaId) {
    try {
        // Use the correct media_id format and remove the status parameter from v2 tweet
        await twitterClient.v2.tweet({
            text: message,
            media: { media_ids: [mediaId] }  // Attach media to tweet
        });
        console.log("Tweet sent:", message);
    } catch (error) {
        console.error("Tweet error:", error.response?.data || error.message);
    }
}

// Function to check the time and tweet when an event starts
async function checkAndTweet() {
    const now = new Date();

    // Loop through events
    for (const event of events) {
        // Loop through dates for each event
        for (const date of event.dates) {
            const eventDate = new Date(date);
            const eventEndDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

            console.log("Checking event:", event.hashtag, "from", eventDate, "to", eventEndDate);

            // Check if the current time is within the event time window
            if (now >= eventDate && now <= eventEndDate) {
                // Calculate the interval for 8 tweets within 2 hours
                const interval = (2 * 60 * 60 * 1000) / 8; // 2 hours divided by 8

                // Calculate the number of tweets already sent
                const tweetsSent = Math.floor((now - eventDate) / interval);

                // If it's time for the next tweet
                if ((now - eventDate) % interval < 60000) { // 1 minute tolerance
                    // Pick a random message for variety
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                    const tweetMessage = randomMessage
                        .replace('EVENT_NAME', event.hashtag)
                        .replace('EVENT_NAME_URL', event.hashtag.replace("#", ""));

                    // Upload image
                    const mediaId = await uploadImage(event.image);

                    // Tweet with image
                    if (mediaId) {
                        await tweet(tweetMessage, mediaId);
                    }
                }
            }
        }
    }
}

// Run check every minute (or adjust interval as needed)
console.log("Tweet bot running...");
checkAndTweet(); // Run immediately
setInterval(checkAndTweet, 60000); // 60,000 ms = 1 minute
