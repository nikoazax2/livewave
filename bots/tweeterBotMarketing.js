import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js'
import path from 'path';

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
async function uploadImage(base64Image, imageName) {
    try {
        // Decode the Base64 string and save it as a temporary file
        const imageBuffer = Buffer.from(base64Image, 'base64');
        const tempImagePath = path.join('./bots/temp', `${imageName}.png`);
        fs.writeFileSync(tempImagePath, imageBuffer);

        // Upload the image to Twitter
        const mediaId = await twitterClient.v1.uploadMedia(tempImagePath, { mimeType: 'image/png' });

        // Clean up the temporary file
        fs.unlinkSync(tempImagePath);

        return { mediaId };
    } catch (error) {
        console.error("Image upload error:", error.response?.data || error.message);
    }
}

// Function to send a tweet with media
async function tweet(message, mediaId) {
    //wait beween 1s and 120 seconds before sending the tweet (don't be suspected as a bot)
    const waitTime = Math.floor(Math.random() * (120 - 1 + 1) + 1) * 1000;
    console.log("Waiting for", waitTime / 1000, "seconds before sending the tweet...");
    await new Promise(resolve => setTimeout(resolve, waitTime));
    try {
        const tweetParams = { text: message };
        if (mediaId?.mediaId) {
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
    const now = new Date();
    const events = await fetchEvents();

    // Loop through events
    for (const event of events) {
        // const messages = JSON.parse(fs.readFileSync('./bots/messages.json', 'utf8'));
        
        // Loop through dates for each event
        if (!event.datestart) { continue; }
        const eventDate = new Date(event.datestart);
        
        const eventEndDate = new Date(event.dateend || eventDate.getTime() + 2 * 60 * 60 * 1000)
        
        //get time before next tweet in minutes
        const nextTweetTimeInMinutes = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60));
        if (nextTweetTimeInMinutes > 0) console.log(`Checking event: ${event.name} - Next tweet in ${nextTweetTimeInMinutes} minutes`);
        
        // Check if the current time is within the event time window
        if (now >= eventDate && now <= eventEndDate) {
            let messages = event.lang == 'fr' ? JSON.parse(fs.readFileSync('./bots/messages.json', 'utf8')) : JSON.parse(fs.readFileSync('./bots/messagesen.json', 'utf8'));
            
            const interval =  (2 * 60 * 60 * 1000) / 10; // 2 hours divided by 10 tweets 

            // If it's time for the next tweet
            if ((now - eventDate) % interval < 60000) { // 1 minute tolerance
                // Pick a random message for variety
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                const tweetMessage = randomMessage
                    .replace('EVENT_NAME_URL', event.name.replace(/ /g, ''))
                    .replace('EVENT_NAME', `#${event.name}`)
                    .replace('EVENT_HASHTAGS', event.hashtags || '')
                    .replace('EVENT_TEXT', event.nameformat)

                let medias = null;

                // Upload image 
                if (event.image) medias = await uploadImage(event.image);

                // Tweet with image 
                await tweet(tweetMessage, medias);
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
