import express from 'express';
import { ApifyClient } from 'apify';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const app = express();
const port = process.env.PORT || 3001;

// Initialiser ApifyClient avec ta clé API
const client = new ApifyClient({
    token: 'apify_api_YL2GnPuq5WStug1PZ4VJGlfaKN4Ia24b4saN',
});

// Initialize Supabase client
const supabaseUrl = 'https://qtziksdhzjvzxongwmsi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0emlrc2Roemp2enhvbmd3bXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTUzNjksImV4cCI6MjA1NzA5MTM2OX0.bIYO0Uw1P6iTXmjgEG49fRQ7OVE39AiEdUAxmKMLKOU';
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/run-scraper', async (req, res) => {
    try {
        const response = await runScraper();
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function runScraper() {
    try {
        // Start the actor and pass input parameters
        const run = await client.actor('karamelo/twitter-trends-scraper').start({ foo: 'bar' });

        // Wait for the actor's run to finish and retrieve the result
        await client.run(run.id).waitForFinish();

        //get the run output

        // https://api.apify.com/v2/datasets/NSydWVpcFfhkafNCS/items?token=apify_api_YL2GnPuq5WStug1PZ4VJGlfaKN4Ia24b4saN

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
    if (new Date().getHours() === 6) {
        let output = await runScraper();

        //write the output to a file at ./public/trends.json
        fs.writeFile('./public/trends.json', JSON.stringify(output), (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
    }

    setTimeout(main, 1800000);


}

// main();

// Function to set all livers columns of table chats to 0
async function resetLivers() {
    try {
        const { data, error } = await supabase
            .from('chats')
            .update({ livers: 0 })
            .neq('livers', 0); // Only update rows where livers is not already 0

        if (error) {
            console.error('Error resetting livers:', error);
        } else {
            console.log('Livers reset successfully:', data);
        }
    } catch (error) {
        console.error('Error in resetLivers function:', error);
    }
}

setInterval(() => {
    const minutes = new Date().getMinutes();
    const seconds = new Date().getSeconds();
    if (minutes % 2 === 1 && seconds === 0) {
        resetLivers();
    }
}, 1000);



app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});