import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs';
// src/supabase.js
import { createClient } from '@supabase/supabase-js'

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)


// Create a Twitter client with OAuth 1.0a User Context
const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
const twitterClient_2 = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY_2,
    appSecret: process.env.TWITTER_API_SECRET_2,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_2,
    accessSecret: process.env.TWITTER_ACCESS_SECRET_2,
});


const messages = JSON.parse(fs.readFileSync('./botMarket/messages.json', 'utf8'));


async function fetchEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('*');

    if (error) {
        console.error("Error fetching events:", error.message);
        return [];
    }

    return data;
}

// Function to upload an image
async function uploadImage(imagePath) {
    try {
        // Use mimeType instead of type for image
        const mediaId = await twitterClient.v1.uploadMedia(imagePath, { mimeType: 'image/jpeg' });
        const mediaId_2 = await twitterClient_2.v1.uploadMedia(imagePath, { mimeType: 'image/jpeg' });
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
        setTimeout(async () => {
            if (mediaId.mediaId_2) {
                tweetParams.media = { media_ids: [mediaId.mediaId_2] };
            }
            await twitterClient_2.v2.tweet(tweetParams);
        }, 2000);
        console.log("Tweet sent:", message);
    } catch (error) {
        console.error("Tweet error:", error.response?.data || error.message);
    }
}

// Function to check the time and tweet when an event starts
async function checkAndTweet() {
    const now = new Date();
    const events = await fetchEvents();

    // Loop through events
    for (const event of events) {
        // Loop through dates for each event
        if (!event.dates) { continue; }
        for (const date of event.dates) {
            const eventDate = new Date(date);
            const eventEndDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

            console.log("Checking event:", event.name);

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
                        .replace('EVENT_NAME', `#${event.name}`)
                        .replace('EVENT_NAME_URL', event.name.replace(/ /g, ''))
                        .replace('EVENT_HASHTAGS', event.hashtags);

                    let medias = null;
                    // Upload image
                    if (event.image) {
                        medias = await uploadImage(event.image);
                    }

                    // Tweet with image
                    if (medias) {
                        await tweet(tweetMessage, medias);
                    }
                }
            }
        }
    }
}


async function main() {
    // Run check every minute (or adjust interval as needed)
    console.log("Tweet bot running...");
    checkAndTweet(); // Run immediately
    setInterval(checkAndTweet, 60000); // 60,000 ms = 1 minute
}


main();
