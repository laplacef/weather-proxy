# Backend Server Implementation (Secure)

To securely use an API key in a front-end application, you typically need a backend server that acts as an intermediary between your front-end and the external API (like OpenWeatherMap). This way, the API key is stored on the server and never exposed to the client-side, thus maintaining security.

In a Node.js environment, you can use the `dotenv` package to load environment variables from a `.env` file. However, in client-side JavaScript running in a browser, environment variables cannot be accessed directly for security reasons.

## Backend Approach

Here's a simplified version of how you could set up a Node.js server to handle this:

### 1. Setup Node.js Server

Create a new file called `server.js` in your project.

```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('src')); // Serve your static files from src

app.get('/weather/:city', async (req, res) => {
    const city = req.params.city;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

### 2. Modify Your Front-end JavaScript

Update your `script.js` to request weather data from your Node.js server instead of directly from OpenWeatherMap.

```javascript
// script.js
document.getElementById('search-button').addEventListener('click', function() {
    const cityName = document.getElementById('search-input').value;
    if (cityName) {
        getWeatherData(cityName)
            .then(displayWeather)
            .catch(handleError);
    }
});

async function getWeatherData(city) {
    const response = await fetch(`/weather/${city}`);
    if (!response.ok) {
        throw new Error(`An error occurred: ${response.status}`);
    }
    return await response.json();
}

// ... rest of your script.js code ...
```

### 3. Install Node.js Dependencies

You will need to install Node.js, Express, `node-fetch`, and `dotenv`. Run the following command in your project directory:

```bash
npm init -y
npm install express node-fetch dotenv
```

### 4. Update Your `.env` File

```javascript
OPENWEATHERMAP_API_KEY=your_api_key_here
```

### 5. Run Your Server

Start your server with `node server.js`. The application will now serve your front-end files and handle API requests securely.

### Conclusion

Using this setup, the API key is stored securely on the server and is not exposed to the client-side. The front-end makes requests to your Node.js server, which in turn fetches data from the OpenWeatherMap API and returns it to the front-end. This is a common pattern for handling sensitive data in web applications.
