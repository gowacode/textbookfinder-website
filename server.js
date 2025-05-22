// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const fetch = require('node-fetch'); // Or import axios from 'axios'; if you chose that
const app = express();

// Environment variables setup
const PORT = process.env.PORT || 3000;
const apiKey = process.env.GOOGLE_API_KEY;
const searchEngineId = process.env.Search_ENGINE_ID;

if (!apiKey || !searchEngineId) {
    console.error("Error: Missing Google API Key or Search Engine ID in .env file.");
    process.exit(1); // Stop the server if keys are missing
}

// Middleware setup
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON (though for this GET request, it's not strictly needed for body parsing)
app.use(express.json());

app.use(express.static('public'));

// Search endpoint
app.get('/api/search', async (req, res) => {
    const userQuery = req.query.query; // Get the query from client-side (e.g., /api/search?query=textbook)

    if (!userQuery) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    // Prepare search query with PDF filter
    const fullQuery = `${userQuery} filetype:pdf`;
    const encodedQuery = encodeURIComponent(fullQuery);
    const googleApiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodedQuery}&key=${apiKey}&cx=${searchEngineId}`;

    try {
        console.log(`Workspaceing from Google API: ${googleApiUrl.replace(apiKey, "REDACTED_API_KEY")}`); // Log without exposing key
        const googleResponse = await fetch(googleApiUrl);
        const data = await googleResponse.json();

        if (!googleResponse.ok) {
            // If Google API returned an error
            console.error("Google API Error:", data);
            return res.status(googleResponse.status).json(data);
        }

        res.json(data); // Send Google's response (or just data.items) back to the client
    } catch (error) {
        console.error("Error calling Google API:", error);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

// Optional: Serve your static files (HTML, CSS, client-side JS)
// Place your index.html, style.css, and original script.js (modified) in a 'public' folder
// app.use(express.static('public')); // Create a 'public' folder and put your html, css, script.js there

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // If serving static files from 'public':
    // console.log(`Frontend accessible at http://localhost:<span class="math-inline">\{PORT\}/index\.html or http\://localhost\:</span>{PORT}`);
});