# Client-Side Implementation (Unsecure)

For a straightforward client-side JavaScript implementation without a backend server or build tool, accessing environment variables like an API key directly from a `.env` file is not feasible. In a typical client-side JavaScript scenario running directly in the browser, you don't have access to Node.js modules or the filesystem, which means you cannot read a `.env` file directly.

However, if you still want to avoid hardcoding the API key in the `script.js` and use a `.env` file, you'd need to use a build tool or task runner that can inject environment variables into your code at build time. This process is usually done in projects set up with tools like Webpack, Parcel, or when using a framework like React.

Since you're looking for a simple approach without these tools, the only secure way to handle API keys in a purely client-side context is to make API requests through a server-side proxy as mentioned earlier.

## Simple Client-Side Implementation

If you choose to proceed with a direct client-side approach (not recommended for production due to security concerns), you would typically include the API key directly in your JavaScript file. But since you want to avoid this, you'll face a limitation in a plain JavaScript setup without additional tooling or a server-side component.

### Workaround for Development

For development purposes, you might consider temporarily using a global variable in your HTML file that you manually set when testing locally. This is not a secure practice for production but can be used for local testing:

#### In your HTML file

```html
<script>
    // This is just for local development and should never be used in production
    const OPENWEATHERMAP_API_KEY = 'your_api_key_here';
</script>
<script src="./js/script.js"></script>
```

#### Then in your `script.js`

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
    const apiKey = 'YOUR_API_KEY'; // Directly include your OpenWeatherMap API key here
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`An error occurred: ${response.status}`);
    }
    return await response.json();
}

// ... rest of your script.js code ...
```

Remember, this is only a temporary workaround for local development and should not be used in a production environment. For any production deployment, you should either include the API key directly in the script (with the risks mentioned earlier) or ideally set up a backend server to handle API requests securely.
