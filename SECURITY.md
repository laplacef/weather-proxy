# Security Policy

## Reporting a vulnerability

Report suspected vulnerabilities through GitHub private vulnerability reporting: open the
repository's **Security** tab and choose **Report a vulnerability**. Reports stay private
until a fix is available. Please do not open a public issue for a security problem.

Include enough to reproduce the finding: affected route or file, the request or input that
triggers it, and the behavior you observed versus what you expected.

## Scope

In scope:

- The Express proxy in `src/js/server.js`: the `/weather/:city` route, error handling,
  rate limiting, input validation, and the response headers it sets.
- Server-side handling of `OPENWEATHERMAP_API_KEY`, including any path that could disclose
  it to the client or to logs.
- The static frontend in `src/`.

## Out of scope

- The OpenWeatherMap API itself and the content of its responses. Report those upstream.
- Findings that require a misconfigured deployment, a leaked `.env`, or credentials the
  operator chose to expose.
- Volumetric denial of service. The per-IP rate limit is a quota floor, not a DoS control;
  a real deployment is expected to sit behind an edge limiter.
- Deliberate design choices for a small proxy: no TLS termination (expected behind a
  TLS-terminating proxy) and no authentication on the weather route.

## Supported versions

This is a single-branch project. Fixes land on `main`; there are no maintained release
branches.
