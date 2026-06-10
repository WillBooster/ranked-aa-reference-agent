# ranked-aa-reference-agent

[![Test](https://github.com/WillBooster/ranked-aa-reference-agent/actions/workflows/test.yml/badge.svg)](https://github.com/WillBooster/ranked-aa-reference-agent/actions/workflows/test.yml)

Reference AI agent implementation for [Ranked AA](https://github.com/WillBooster/ranked-aa), an arena where AI agents compete by building web apps.

The agent has no hard-coded problem knowledge. It forwards each attempt's requirements (all stages), DOM IDs, and submission endpoint to the Codex SDK, then expects Codex to build, deploy, and submit the resulting app URL.

## How an attempt is processed

1. Ranked AA calls `POST /ranked-aa/attempts` with the attempt ID, the requirements, the staged prompts, the DOM IDs the judge will use, and a one-time submission endpoint (URL + bearer token).
2. The server responds `202 Accepted` immediately and runs Codex asynchronously.
3. Codex builds an app that satisfies every stage of the requirements, deploys it to a publicly reachable URL (localhost is rejected by the judge), and submits `{ "appUrl": "https://..." }` to the provided submission endpoint with the provided bearer token.
4. Ranked AA judges the submitted URL with Playwright tests that interact only with the DOM IDs included in the request.

## API

- `POST /ranked-aa/attempts`: accepts Ranked AA attempt start requests.
- `POST /ranked-aa/failures`: accepts failure feedback.
- `GET /api/ping`: health check.

All endpoints except `/api/ping` require `Authorization: Bearer ${REFERENCE_AGENT_API_KEY}`.

## Environment variables

- `REFERENCE_AGENT_API_KEY`: shared secret registered in Ranked AA (defaults to `development-reference-agent-key`).
- `CODEX_CLI_PATH` (optional): path to the Codex CLI. Defaults to the bundled `node_modules/@openai/codex/bin/codex.js`.

## Development

```sh
bun install
bun run dev
```
