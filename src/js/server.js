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

// Fixed-window rate limit per client IP. The weather route is an open
// relay to a shared upstream quota, so cap how fast one caller can spend
// it. This is a floor, not a replacement for an edge limiter in front of
// a real deployment.
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;
const hits = new Map();

function rateLimit(req, res, next) {
    const now = Date.now();
    let entry = hits.get(req.ip);
    if (!entry || now >= entry.resetAt) {
        entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
        hits.set(req.ip, entry);
    }
    entry.count += 1;
    if (entry.count > RATE_LIMIT) {
        res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
        return res.status(429).json({ error: 'Too many requests.' });
    }
    next();
}

// Drop expired entries so the map cannot grow without bound. unref() keeps
// the timer from holding the process open on its own.
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
        if (now >= entry.resetAt) hits.delete(ip);
    }
}, RATE_WINDOW_MS).unref();

app.get('/weather/:city', rateLimit, async (req, res) => {
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
