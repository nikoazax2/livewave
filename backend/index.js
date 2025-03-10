const express = require('express');
const { ApifyClient } = require('apify');

const app = express();
const port = process.env.PORT || 3001;

// Initialiser ApifyClient avec ta clé API
const client = new ApifyClient({
    token: 'apify_api_YL2GnPuq5WStug1PZ4VJGlfaKN4Ia24b4saN',
});

app.get('/run-scraper', async (req, res) => {
    try {
        const run = await client.actor('karamelo/twitter-trends-scraper').call();
        res.json(run);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
