const path = require('path');
const express = require('express');
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

// Drop expired entries so the maps cannot grow without bound. unref() keeps
// the timer from holding the process open on its own.
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
        if (now >= entry.resetAt) hits.delete(ip);
    }
    for (const [key, entry] of cache) {
        if (now >= entry.expiresAt) cache.delete(key);
    }
}, RATE_WINDOW_MS).unref();

const UPSTREAM_TIMEOUT_MS = 5000;

// Short-lived per-city cache. Weather changes slowly relative to how often
// a page might be refreshed, so a few minutes of reuse spares the upstream
// quota and speeds repeat lookups. Keyed by the normalized city name.
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

// Letters, marks, spaces, and the punctuation that appears in place names,
// including the "City,CC" form OpenWeatherMap accepts. Anything else is
// rejected before a request is built, ahead of the encoding below.
const CITY_PATTERN = /^[\p{L}\p{M}\s.,'-]{1,80}$/u;

app.get('/weather/:city', rateLimit, async (req, res) => {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
        console.error('OPENWEATHERMAP_API_KEY is not set');
        return res.status(500).json({ error: 'Server is not configured.' });
    }

    const rawCity = req.params.city;
    if (!CITY_PATTERN.test(rawCity)) {
        return res.status(400).json({ error: 'Invalid city name.' });
    }

    const cacheKey = rawCity.trim().toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
        return res.json(cached.data);
    }

    // encodeURIComponent keeps a city name containing & or = from injecting
    // additional query parameters into the upstream request.
    const city = encodeURIComponent(rawCity);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    // Abort a slow upstream so a hung request cannot pin a connection open.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
            console.error(`OpenWeatherMap returned ${response.status}`);
            return response.status === 404
                ? res.status(404).json({ error: 'City not found.' })
                : res.status(502).json({ error: 'Weather data is unavailable.' });
        }

        // Return only the fields the client renders. The upstream payload
        // carries coordinates, station ids, and internal codes the browser
        // has no use for and that need not leave the server.
        const payload = await response.json();
        const data = {
            city: payload.name,
            temperature: payload.main.temp,
            description: payload.weather[0].description,
            humidity: payload.main.humidity,
            windSpeed: payload.wind.speed,
        };

        cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
        res.json(data);
    } catch (error) {
        // Logged server-side only. The client gets a fixed string so upstream
        // error text and network details stay internal.
        console.error('Weather lookup failed:', error);
        const status = error.name === 'AbortError' ? 504 : 502;
        res.status(status).json({ error: 'Weather data is unavailable.' });
    } finally {
        clearTimeout(timeout);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
