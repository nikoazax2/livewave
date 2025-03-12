import express from 'express';
import { ApifyClient } from 'apify';
import fs from 'fs'; 
const app = express(); 

// Initialiser ApifyClient avec ta clé API
const client = new ApifyClient({
    token: 'apify_api_YL2GnPuq5WStug1PZ4VJGlfaKN4Ia24b4saN',
});
 
async function runScraper() {
    try {
        // Start the actor and pass input parameters
        const run = await client.actor('karamelo/twitter-trends-scraper').start({ foo: 'bar' });

        // Wait for the actor's run to finish and retrieve the result
        await client.run(run.id).waitForFinish();

        let output = await fetch(`https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?token=apify_api_YL2GnPuq5WStug1PZ4VJGlfaKN4Ia24b4saN`)
        output = await output.json();

        return output
    } catch (error) {
        console.log('Error running the actor:', error);
        throw error;
    }
}

async function main() {

    //everyday at 6am run the scraper 
    // if (new Date().getHours() === 6) {
    let output = await runScraper();

    //write the output to a file at ./public/trends.json
    fs.writeFile('./public/trends.json', JSON.stringify(output), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
    // }

    // setTimeout(main, 1800000);
}

main();