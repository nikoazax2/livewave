// Imports nécessaires
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { BskyAgent, RichText } from '@atproto/api';
import axios from 'axios';
import sharp from 'sharp';

// Chargement des variables d’environnement (.env)
dotenv.config();

// Initialisation du client Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Connexion à Bluesky avec les identifiants du bot
const agent = new BskyAgent({ service: 'https://bsky.social' });
await agent.login({
    identifier: 'sagenicolas38@gmail.com',
    password: process.env.BSKY_PASSWORD
});

// Liste des clients Twitter (tu peux en ajouter d’autres ici)
const twitterClients = [
    new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET
    })
];

let emojis = ["🗣️", "💬", "📺", "🎤", "🎧", "📻", "📱", "💻", "🌐"]

// Configuration générale
const forceDirectEvent = "x"; // Permet de forcer un event en mode debug
const interval = 8; // Intervalle entre les posts (en minutes)
let minutePassed = interval; // Minuteur interne

// Récupération des événements depuis Supabase
async function fetchEvents() {
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
        console.error("Erreur lors du fetch Supabase:", error.message);
        return [];
    }
    return data;
}

// Publication sur Bluesky avec image OG et lien LiveWave
async function bs(message, imgOG, url, eventName) {
    try {
        const rt = new RichText({ text: message });
        await rt.detectFacets(agent); // Pour gérer les liens, mentions, etc.

        const ogTitle = `Discutez de ${eventName} sur LiveWave`;
        const ogDescription = 'Rejoignez la conversation sur LiveWave !';

        // Récupération de l'image OG
        const imageResponse = await axios.get(imgOG, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'LiveWave Bot' }
        });
        const imageBuffer = Buffer.from(imageResponse.data);

        // Compression/redimensionnement de l'image (Bluesky limite à ~976Ko)
        let resizedImageBuffer = await sharp(imageBuffer)
            .resize({ width: 1200 })
            .jpeg({ quality: 80 })
            .toBuffer();

        let quality = 80;
        while (resizedImageBuffer.length > 975000 && quality > 40) {
            quality -= 10;
            resizedImageBuffer = await sharp(imageBuffer)
                .resize({ width: 1200 })
                .jpeg({ quality })
                .toBuffer();
        }

        // Upload de l'image et publication sur Bluesky
        const blob = await agent.uploadBlob(resizedImageBuffer, {
            encoding: 'image/jpeg',
        });

        await agent.post({
            text: rt.text,
            facets: rt.facets,
            embed: {
                $type: 'app.bsky.embed.external',
                external: {
                    uri: url,
                    title: ogTitle,
                    description: ogDescription,
                    thumb: blob.data.blob,
                }
            }
        });
    } catch (error) {
        console.error("Erreur Bluesky:", error.response?.data || error.message);
    }
}

// Envoi d’un tweet via un client donné
async function tweet(message, twitterClient) {
    try {
        let res = await twitterClient.v2.tweet({ text: message });
        console.log("Tweet envoyé:", message);

        // likeTweet(res?.data?.id, twitterClient);
    } catch (error) {
        console.error("Erreur tweet:", error.data || error.message);
    }
}

// Like d’un tweet via un client donné
async function likeTweet(tweetId, twitterClient) {
    try {
        // Get the user ID of the authenticated account
        const { data: user } = await twitterClient.v2.me();
        await twitterClient.v2.like(user.id, tweetId);
        console.log(`👍 Liked tweet ${tweetId}`);
    } catch (error) {
        console.error("Erreur lors du like:", error.data || error.message);
    }
}

// Vérifie chaque minute si un tweet doit être envoyé
async function checkAndTweet() {
    const now = new Date();
    const events = await fetchEvents();

    for (const event of events) {
        if (!event.datestart) continue;

        const eventDate = new Date(event.datestart);
        const eventEndDate = new Date(event.dateend || eventDate.getTime() + 2 * 60 * 60 * 1000);

        const nextTweetTimeInMinutes = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60));
        if (nextTweetTimeInMinutes > 0) {
            console.log(`🕒 ${now.toLocaleString()} — ${event.name} dans ${nextTweetTimeInMinutes} min`);
        }

        // Si l'event est en cours (ou forcé), on continue
        if ((now >= eventDate && now <= eventEndDate) || event.id === forceDirectEvent) {
            const messages = event.tweets || JSON.parse(fs.readFileSync('./bots/messages.json', 'utf8'))

            console.log(`⌛ Tweet dans ${interval - minutePassed} min (${event.name})`);

            if (minutePassed >= interval || event.id === forceDirectEvent) {
                // On génère un message par client Twitter
                const tweetMessages = twitterClients.map(() =>
                    getRandomMessageTweeter(messages, event)
                );
                const bsMessage = getRandomMessageBluesky(messages, event);

                // Petite pause random pour éviter les doublons
                const randomWait = Math.floor(Math.random() * 30000);
                await new Promise(resolve => setTimeout(resolve, randomWait));

                // Post Bluesky
                bs(bsMessage, event.og, 'https://livewave.fr/chat/' + event.name, event.nameformat);

                // Tweet réparti entre les clients, espacés équitablement
                twitterClients.forEach((client, index) => {
                    const delay = (index * interval * 60000) / twitterClients.length;
                    setTimeout(() => {
                        tweet(tweetMessages[index], client);
                    }, delay);
                });

                minutePassed = 0;
            } else {
                minutePassed++;
            }
        }
    }
}

// Génère un message pour Bluesky
function getRandomMessageBluesky(messages, event) {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    return randomMessage
        .replace('a', '')
        .replace('EVENT_NAME', `#${event.name}`)
        .replace('EVENT_HASHTAGS', event.hashtags || '')
        .replace('EVENT_TEXT', event.nameformat);
}

// Génère un message pour Twitter avec le lien vers LiveWave
function getRandomMessageTweeter(messages, event) {
    const url = '\n➡️ https://www.livewave.fr/chat/';
    let randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    randomMessage = randomMessage += ` ${randomEmoji}`; // Ajout d'un emoji aléatoire
    return randomMessage
        .replace('EVENT_NAME_URL', url + event.name.replace(/ /g, ''))
        .replace('EVENT_NAME', `#${event.name}`)
        .replace('EVENT_HASHTAGS', event.hashtags || '')
        .replace('EVENT_TEXT', event.nameformat);
}

// Boucle principale (lancée toutes les minutes)
async function main() {
    console.log("🚀 Bot lancé !");
    checkAndTweet(); // Lancement immédiat
    setInterval(checkAndTweet, 60000); // Toutes les minutes
}

main(); // ← Décommente pour lancer le bot en prod
