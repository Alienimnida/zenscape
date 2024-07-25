const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const recombee = require('recombee-api-client');
const rqs = recombee.requests;
const SpotifyWebApi = require('spotify-web-api-node');
const NodeCache = require('node-cache');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = 3001;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
app.use(bodyParser.json());
const corsOptions = {
    origin: 'https://zenscape-app.vercel.app',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const endpointCorsOptions = cors({
    origin: 'https://zenscape-app.vercel.app',
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
});
app.options('/recommendations', endpointCorsOptions);
app.options('/play-song', endpointCorsOptions);
app.options('/save-playlist', endpointCorsOptions);

// Recombee setup
const client = new recombee.ApiClient(process.env.RECOMBEE_DATABASE_ID, process.env.RECOMBEE_PRIVATE_TOKEN);

function hashUserId(userId) {
    return crypto.createHash('md5').update(userId).digest('hex');
}

app.get('/', async (req, res) => {
    res.send("Hello world");
});

// Endpoint to handle recommendation requests
app.post('/recommendations', async (req, res) => {
    const { userId, mood, activity, isAuthenticated } = req.body;

    if (!isAuthenticated) {
        return res.status(401).json({ error: 'Please login to get recommendations' });
    }

    try {
        const recombeeRecommendations = await getRecommendationsFromRecombee(userId, mood, activity);

        if (recombeeRecommendations.length > 0) {
            res.json({ recommendations: recombeeRecommendations });
        } else {
            const genre = await getRecommendations(mood, activity);
            let tracks;
            try {
                tracks = await getSpotifyTracks(genre);
            } catch (spotifyError) {
                console.error('Spotify API error:', spotifyError);
                tracks = await getFallbackTracks();
            }

            await storeRecommendationsInRecombee(mood, activity, tracks, userId);
            res.json({ recommendations: tracks });
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error.message);
        res.status(500).json({ error: 'Error fetching recommendations', message: error.message });
    }
});

// Endpoint to keep track of play count
app.post('/play-song', async (req, res) => {
    const { userId, trackId } = req.body;
    const hashedUserId = hashUserId(userId);

    try {
        // Add detail view
        await client.send(new rqs.AddDetailView(hashedUserId, trackId, {
            'cascadeCreate': true,
            'timestamp': new Date().toISOString(),
        }));

        // Get current item values
        const itemValues = await client.send(new rqs.GetItemValues(trackId));

        // Increment play count
        const currentPlayCount = itemValues.playCount || 0;
        const newPlayCount = currentPlayCount + 1;

        // Set new play count
        await client.send(new rqs.SetItemValues(trackId, {
            'playCount': newPlayCount
        }, {
            'cascadeCreate': true
        }));

        res.status(200).json({ message: 'Play recorded successfully' });
    } catch (error) {
        console.error('Error recording play:', error);
        res.status(500).json({ error: 'Error recording play' });
    }
});

// New endpoint to save playlist to Spotify                     
app.post('/save-playlist', async (req, res) => {
    try {
        const { accessToken, tracks, mood, activity } = req.body;

        if (!accessToken || !tracks || !mood || !activity) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const spotifyApi = new SpotifyWebApi({
            accessToken: accessToken
        });

        // Create a new playlist
        const playlistName = `${mood} ${activity} - Zenscape`;
        const playlistDescription = `A playlist for ${mood} ${activity} created by Zenscape`;

        let playlist;
        try {
            playlist = await spotifyApi.createPlaylist(playlistName, { 'description': playlistDescription, 'public': true });
        } catch (error) {
            console.error('Error creating playlist:', error);
            return res.status(500).json({ error: 'Failed to create playlist' });
        }

        // Add tracks to the playlist
        const trackUris = tracks.map(track => track.uri);
        try {
            await spotifyApi.addTracksToPlaylist(playlist.body.id, trackUris);
        } catch (error) {
            console.error('Error adding tracks to playlist:', error);
            return res.status(500).json({ error: 'Failed to add tracks to playlist' });
        }

        res.json({ success: true, playlistId: playlist.body.id });
    } catch (error) {
        console.error('Error saving playlist:', error);
        res.status(500).json({ error: 'An error occurred while saving the playlist' });
    }
});

// Function to get recommendations using AI21 API
async function getAI21Recommendations(mood, activity) {
    const AI21_API_KEY = process.env.AI21_API_KEY;
    const url = 'https://api.ai21.com/studio/v1/j2-ultra/complete';

    const prompt = `
You are an AI music assistant specializing in recommending lofi sub-genres based on a user's mood and activity. Here are the lofi sub-genres and their corresponding names in the Spotify API:

Lofi Hip-Hop - lo-fi beats
Chillhop - chillhop
Lofi Jazz - lo-fi jazz
Lofi House - lo-fi house
Lofi R&B - lo-fi r&b
Lofi Ambient - lo-fi ambient
Lofi Electronica - lo-fi electronic
Lofi Funk - lo-fi funk
Lofi Rock - lo-fi rock
Consider both the user's mood and activity equally when recommending the most suitable lofi sub-genre. Ensure the recommendations are diverse and avoid repeatedly suggesting the same sub-genre.

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
        console.log('AI21 Recommended Genre:', genre);
        return genre;
    } catch (error) {
        console.error('Error from AI21 API:', error.response?.data || error.message);
        throw new Error('Error fetching recommendations from AI21 API');
    }
}

async function getRecommendations(mood, activity) {
    try {
        const genre = await getAI21Recommendations(mood, activity);
        return genre;
    } catch (error) {
        console.error('Error getting AI21 recommendations:', error);
        return getFallbackGenre(mood, activity);
    }
}

function getFallbackGenre(mood, activity) {
    if (mood === 'relaxed' && activity === 'studying') {
        return 'lo-fi beats';
    }
    return 'chillhop'; // Default fallback
}

// Function to get Spotify tracks based on genre
async function getSpotifyTracks(genre, retries = 3) {
    const cacheKey = `spotify_tracks_${genre}`;
    const cachedTracks = cache.get(cacheKey);

    if (cachedTracks) {
        return cachedTracks;
    }

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
                limit: 30
            }
        });

        const tracks = searchResponse.data.tracks.items.map(track => ({
            name: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            album: track.album.name,
            preview_url: track.preview_url,
            spotify_url: track.external_urls.spotify,
            uri: track.uri,
            album_image: track.album.images[0]?.url
        }));

        cache.set(cacheKey, tracks);
        return tracks;
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying Spotify request. Attempts left: ${retries - 1}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
            return getSpotifyTracks(genre, retries - 1);
        }
        console.error('Error fetching tracks from Spotify:', error.response?.data || error.message);
        throw new Error('Error fetching tracks from Spotify');
    }
}

async function getFallbackTracks() {
    return [
        { name: 'Chillhop Lo Fi', artist: 'Aesthetic Music, Jazzy LoFi, Gaming Music', album: 'Aesthetic LoFi Hip Hop Beats', preview_url: 'https://p.scdn.co/mp3-preview/4cf5dd138de9569bbfdab4c06493a03e3573a852?cid=c20f9261c3f24745a80e7e07e97d4946', spotify_url: 'https://open.spotify.com/track/3ER8oZidYXK1ji8VYskKD7', uri: 'spotify:track:3ER8oZidYXK1ji8VYskKD7', album_image: 'https://i.scdn.co/image/ab67616d0000b273696616bc6abbd7797b0c4c0a' },
        { name: 'Chillhop Lo Fi', artist: 'Aesthetic Music, Jazzy LoFi, Gaming Music', album: 'Aesthetic LoFi Hip Hop Beats', preview_url: 'https://p.scdn.co/mp3-preview/4cf5dd138de9569bbfdab4c06493a03e3573a852?cid=c20f9261c3f24745a80e7e07e97d4946', spotify_url: 'https://open.spotify.com/track/3ER8oZidYXK1ji8VYskKD7', uri: 'spotify:track:3ER8oZidYXK1ji8VYskKD7', album_image: 'https://i.scdn.co/image/ab67616d0000b273696616bc6abbd7797b0c4c0a' },
        { name: 'Chillhop Lo Fi', artist: 'Aesthetic Music, Jazzy LoFi, Gaming Music', album: 'Aesthetic LoFi Hip Hop Beats', preview_url: 'https://p.scdn.co/mp3-preview/4cf5dd138de9569bbfdab4c06493a03e3573a852?cid=c20f9261c3f24745a80e7e07e97d4946', spotify_url: 'https://open.spotify.com/track/3ER8oZidYXK1ji8VYskKD7', uri: 'spotify:track:3ER8oZidYXK1ji8VYskKD7', album_image: 'https://i.scdn.co/image/ab67616d0000b273696616bc6abbd7797b0c4c0a' },
        { name: 'Chillhop Lo Fi', artist: 'Aesthetic Music, Jazzy LoFi, Gaming Music', album: 'Aesthetic LoFi Hip Hop Beats', preview_url: 'https://p.scdn.co/mp3-preview/4cf5dd138de9569bbfdab4c06493a03e3573a852?cid=c20f9261c3f24745a80e7e07e97d4946', spotify_url: 'https://open.spotify.com/track/3ER8oZidYXK1ji8VYskKD7', uri: 'spotify:track:3ER8oZidYXK1ji8VYskKD7', album_image: 'https://i.scdn.co/image/ab67616d0000b273696616bc6abbd7797b0c4c0a' },
        { name: 'Chillhop Lo Fi', artist: 'Aesthetic Music, Jazzy LoFi, Gaming Music', album: 'Aesthetic LoFi Hip Hop Beats', preview_url: 'https://p.scdn.co/mp3-preview/4cf5dd138de9569bbfdab4c06493a03e3573a852?cid=c20f9261c3f24745a80e7e07e97d4946', spotify_url: 'https://open.spotify.com/track/3ER8oZidYXK1ji8VYskKD7', uri: 'spotify:track:3ER8oZidYXK1ji8VYskKD7', album_image: 'https://i.scdn.co/image/ab67616d0000b273696616bc6abbd7797b0c4c0a' },
    ];
}

async function updateNullPlayCounts() {
    try {
        const items = await client.send(new rqs.ListItems());
        const updateRequests = items.map(item =>
            new rqs.SetItemValues(item.itemId, { 'playCount': 0 }, { 'cascadeCreate': true })
        );
        await client.send(new rqs.Batch(updateRequests));
        console.log('Null playCount values updated to 0');
    } catch (error) {
        console.error('Error updating null playCount values:', error);
    }
}

// Call this function once to update existing items
updateNullPlayCounts();

// Function to get recommendations from Recombee
async function getRecommendationsFromRecombee(userId, mood, activity) {
    try {
        const hashedUserId = hashUserId(userId);
        const response = await client.send(new rqs.RecommendItemsToUser(
            hashedUserId,
            30,
            {
                'returnProperties': true,
                'cascadeCreate': true,
                'filter': `'mood' == "${mood}" AND 'activity' == "${activity}"`
            }
        ));
        return response.recomms.map(rec => rec.values);
    } catch (error) {
        console.error('Error getting recommendations from Recombee:', error);
        return [];
    }
}

// Function to store recommendations in Recombee
async function storeRecommendationsInRecombee(mood, activity, tracks, userId) {
    const hashedUserId = hashUserId(userId);
    const setItemValuesRequests = tracks.map(track => {
        const trackId = `track-${track.uri}`;
        return new rqs.SetItemValues(trackId, {
            'uri': track.uri,
            'name': track.name,
            'artist': track.artist,
            'album': track.album,
            'album_image': track.album_image,
            'preview_url': track.preview_url,
            'spotify_url': track.spotify_url,
            'mood': mood,
            'activity': activity,
            'playCount': 0  // Explicitly set to 0
        }, { 'cascadeCreate': true });
    });

    // Create AddDetailView requests for each track
    const addDetailViewRequests = tracks.map(track => {
        const trackId = `track-${track.uri}`;
        return new rqs.AddDetailView(userId, trackId, { 'cascadeCreate': true });
    });

    // Combine both sets of requests into one batch
    const requests = [...setItemValuesRequests, ...addDetailViewRequests];

    try {
        await client.send(new rqs.Batch(requests));
        console.log('Recommendations stored in Recombee');
    } catch (error) {
        console.error('Error storing recommendations in Recombee:', error);
    }
}

// Function to set up Recombee database
async function setupRecombeeDatabase() {
    const requests = [
        new rqs.AddItemProperty('mood', 'string'),
        new rqs.AddItemProperty('activity', 'string'),
        new rqs.AddItemProperty('name', 'string'),
        new rqs.AddItemProperty('artist', 'string'),
        new rqs.AddItemProperty('album', 'string'),
        new rqs.AddItemProperty('preview_url', 'string'),
        new rqs.AddItemProperty('spotify_url', 'string'),
        new rqs.AddItemProperty('uri', 'string'),
        new rqs.AddItemProperty('album_image', 'string'),
        new rqs.AddItemProperty('playCount', 'int')
    ];

    try {
        await client.send(new rqs.Batch(requests));
        console.log('Recombee database setup complete');
    } catch (error) {
        console.error('Error setting up Recombee database:', error);
    }
}

// Call this function when your server starts
setupRecombeeDatabase();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;