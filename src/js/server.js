const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Do not advertise the framework to clients.
app.disable('x-powered-by');

// The frontend loads only its own same-origin assets and the API returns
// JSON, so lock every fetch to 'self' and forbid framing outright.
app.use((req, res, next) => {
    res.set({
        'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
    });
    next();
});

// Resolved from __dirname so the server works regardless of the working
// directory it was started from.
app.use(express.static(path.join(__dirname, '..')));

app.get('/weather/:city', async (req, res) => {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
        console.error('OPENWEATHERMAP_API_KEY is not set');
        return res.status(500).json({ error: 'Server is not configured.' });
    }

    // encodeURIComponent keeps a city name containing & or = from injecting
    // additional query parameters into the upstream request.
    const city = encodeURIComponent(req.params.city);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`OpenWeatherMap returned ${response.status}`);
            return response.status === 404
                ? res.status(404).json({ error: 'City not found.' })
                : res.status(502).json({ error: 'Weather data is unavailable.' });
        }

        res.json(await response.json());
    } catch (error) {
        // Logged server-side only. The client gets a fixed string so upstream
        // error text and network details stay internal.
        console.error('Weather lookup failed:', error);
        res.status(502).json({ error: 'Weather data is unavailable.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
