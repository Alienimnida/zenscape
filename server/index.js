const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());


const corsOptions = {
    origin: 'https://zenscape-app.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.options('/recommendations', cors({
    origin: 'https://zenscape-app.vercel.app',
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
}));

app.get('/', async (req, res) => {
    res.send("Hello world")
})
// Endpoint to handle recommendation requests
app.post('/recommendations', async (req, res) => {
    const { mood, activity } = req.body;

    try {
        const genre = await getRecommendations(mood, activity);
        const tracks = await getSpotifyTracks(genre);
        res.json({ recommendations: tracks });
    } catch (error) {
        console.error('Error fetching recommendations:', error.message);
        res.status(500).json({ error: 'Error fetching recommendations' });
    }
});

// Function to get recommendations using AI21 API
async function getRecommendations(mood, activity) {
    const AI21_API_KEY = process.env.AI21_API_KEY; // Access API key from environment variable
    const url = 'https://api.ai21.com/studio/v1/j2-ultra/complete';

    const prompt = `
You are an AI music assistant specializing in recommending lofi sub-genres based on a user's mood and activity. Here are the lofi sub-genres and their corresponding names in the Spotify API:

1. Lofi Hip-Hop - lo-fi beats
2. Chillhop - chillhop
3. Lofi Jazz - lo-fi jazz
4. Lofi House - lo-fi house
5. Lofi R&B - lo-fi r&b
6. Lofi Ambient - lo-fi ambient
7. Lofi Electronica - lo-fi electronic
8. Lofi Funk - lo-fi funk
9. Lofi Rock - lo-fi rock

Based on the user's mood and activity, recommend the most suitable lofi sub-genre and provide the corresponding Spotify API genre name as the response. Only provide the Spotify API genre name.

Here are the user's details:
Mood: ${mood}
Activity: ${activity}

Please recommend the best lofi sub-genre and respond with the corresponding Spotify API genre name.
`;

    try {
        const response = await axios.post(url, {
            prompt,
            maxTokens: 50,
            temperature: 0.7,
            stopSequences: ["\n"]
        }, {
            headers: {
                'Authorization': `Bearer ${AI21_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const genre = response.data.completions[0].data.text.trim();
        console.log(genre);
        return genre;
    } catch (error) {
        console.error('Error from AI21 API:', error.response?.data || error.message);
        throw new Error('Error fetching recommendations from AI21 API');
    }
}

// Function to get Spotify tracks based on genre
async function getSpotifyTracks(genre) {
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    try {
        // Get Spotify access token
        const authResponse = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = authResponse.data.access_token;
        const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                q: genre,
                type: 'track',
                limit: 10
            }
        });

        const tracks = searchResponse.data.tracks.items.map(track => ({
            name: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            album: track.album.name,
            preview_url: track.preview_url,
            spotify_url: track.external_urls.spotify
        }));

        return tracks;
    } catch (error) {
        console.error('Error fetching tracks from Spotify:', error.response?.data || error.message);
        throw new Error('Error fetching tracks from Spotify');
    }
}



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = app;
