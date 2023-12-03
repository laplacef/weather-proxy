// Importing required modules
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

// Creating an instance of Express app
const app = express();
const port = process.env.PORT || 3000;

// Serving static files from the 'src' directory
app.use(express.static('src'));

// Handling GET requests for weather data
app.get('/weather/:city', async (req, res) => {
    const city = req.params.city;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        // Sending a GET request to the OpenWeatherMap API
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        // Handling errors and sending an error response
        res.status(500).json({ message: error.message });
    }
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
