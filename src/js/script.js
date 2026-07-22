document.getElementById('search-button').addEventListener('click', function () {
    const cityName = document.getElementById('search-input').value;
    if (cityName) {
        getWeatherData(cityName)
            .then(displayWeather)
            .catch(handleError);
    }
});

async function getWeatherData(city) {
    const response = await fetch(`/weather/${encodeURIComponent(city)}`);
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Weather data is unavailable.');
    }
    return await response.json();
}

function displayWeather(weatherData) {
    const rows = [
        ['Temperature', `${weatherData.main.temp}°C`],
        ['Description', weatherData.weather[0].description],
        ['Humidity', `${weatherData.main.humidity}%`],
        ['Wind Speed', `${weatherData.wind.speed} m/s`],
    ];

    const heading = document.createElement('h2');
    heading.textContent = weatherData.name;

    const fragment = document.createDocumentFragment();
    fragment.append(heading);

    for (const [label, value] of rows) {
        const p = document.createElement('p');
        p.textContent = `${label}: ${value}`;
        fragment.append(p);
    }

    render(fragment);
}

function handleError(error) {
    const p = document.createElement('p');
    p.textContent = `Error: ${error.message}`;
    render(p);
}

function render(node) {
    const weatherInfoDiv = document.getElementById('weather-info');
    weatherInfoDiv.replaceChildren(node);
}
