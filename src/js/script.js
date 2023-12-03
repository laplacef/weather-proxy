// Attach a click event listener to the search button
document.getElementById('search-button').addEventListener('click', function () {
    const cityName = document.getElementById('search-input').value;
    if (cityName) {
        // Call the getWeatherData function with the cityName as parameter
        getWeatherData(cityName)
            .then(displayWeather) // Display the weather data on success
            .catch(handleError); // Handle any errors that occur
    }
});

// Function to fetch weather data for a given city
async function getWeatherData(city) {
    const response = await fetch(`/weather/${city}`);
    if (!response.ok) {
        throw new Error(`An error occurred: ${response.status}`);
    }
    return await response.json();
}

// Function to display the weather information on the page
function displayWeather(weatherData) {
    const weatherInfoDiv = document.getElementById('weather-info');
    const temperature = weatherData.main.temp;
    const description = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;

    // Update the weatherInfoDiv with the weather data
    weatherInfoDiv.innerHTML = `
        <h2>${weatherData.name}</h2>
        <p>Temperature: ${temperature}°C</p>
        <p>Description: ${description}</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
    `;
}

// Function to handle errors and display error message
function handleError(error) {
    const weatherInfoDiv = document.getElementById('weather-info');
    weatherInfoDiv.innerHTML = `<p>Error: ${error.message}</p>`;
}
