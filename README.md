# Weather Proxy

Look up the current weather for a city. The browser sends the city name to a small Express
server, which calls the [OpenWeatherMap](https://openweathermap.org/) API and returns the
result.

The server exists to hold the API key. A key embedded in client-side JavaScript is readable
by anyone who opens developer tools, so this app keeps it in the server environment. The
browser never sees the key and never contacts OpenWeatherMap directly.

## Requirements

- [Node.js](https://nodejs.org/) 22 or later, which includes npm.
- An OpenWeatherMap API key, free from their [sign-up page](https://home.openweathermap.org/users/sign_up).

## Setup

1. Install dependencies:

   ```sh
   npm ci
   ```

2. Copy the example environment file:

   ```sh
   cp .env.example .env
   ```

   Set `OPENWEATHERMAP_API_KEY` in the new file. `.env` is ignored by git. `.env.example`
   contains no real values and is safe to commit.

3. Start the server:

   ```sh
   npm start
   ```

The app runs at `http://localhost:3000`. Set `PORT` to listen on a different port.

## License

MIT. See [LICENSE](LICENSE).
