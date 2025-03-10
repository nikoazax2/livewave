import express from 'express';
import { ApifyClient } from 'apify';
import fs from 'fs';
const app = express();
const port = process.env.PORT || 3001;

// Initialiser ApifyClient avec ta clé API
const client = new ApifyClient({
    token: 'apify_api_YL2GnPuq5WStug1PZ4VJGlfaKN4Ia24b4saN',
});

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

async function main(){
    //everyday at 6am run the scraper 
    if(new Date().getHours() === 6){
        let output = await runScraper();

        //write the output to a file at ./public/trends.json
        fs.writeFile('./public/trends.json', JSON.stringify(output), (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
    }
    
    setTimeout(main, 1800000);
}

main();

app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});