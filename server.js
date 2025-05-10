const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/download', async (req, res) => {
    try {
        const { url } = req.body;
       
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
       
        // Fetch the Instagram page
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
       
        const html = response.data;
        const $ = cheerio.load(html);
       
        // Try to find video URL in meta tags
        let videoUrl = $('meta[property="og:video"]').attr('content') ||
                      $('meta[property="og:video:url"]').attr('content');
       
        if (!videoUrl) {
            // Alternative method for some Instagram pages
            const scriptTags = $('script').toString();
            const videoUrlMatch = scriptTags.match(/"video_url":"([^"]+)"/);
            if (videoUrlMatch) {
                videoUrl = videoUrlMatch[1].replace(/\\u0026/g, '&');
            }
        }
       
        if (!videoUrl) {
            return res.status(404).json({ error: 'No video found at this URL' });
        }
       
        res.json({ videoUrl });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch video information' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
