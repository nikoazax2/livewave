const express = require('express');
const { ApifyClient } = require('apify');

const app = express();
const port = process.env.PORT || 3001;

// Initialiser ApifyClient avec ta clé API
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

app.get('/run-scraper', async (req, res) => {
    try {
        const run = await client.actor('apify/hello-world').call();
        res.json(run);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
