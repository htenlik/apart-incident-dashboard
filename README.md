# AI Incident Timeline & Evidence Dashboard

An interactive evidence dashboard reconstructing the 2026 OpenAI–Hugging Face incident from public sources.

The project separates the public record into three evidence states:

- Confirmed
- Disputed
- Uncertain

It also provides actionable follow-up checks and watch points derived from the incident record.

## Project Context

Built for the Apart AI Incident Response Sprint.

**Track:** Incident Analysis

**Research question:**

> What does the public record of the OpenAI–Hugging Face incident establish, dispute, or leave uncertain, and can a structured evidence dashboard make those distinctions easier to verify?

## Features

- Interactive incident timeline
- 30 curated evidence records
- Confirmed / Disputed / Uncertain classification
- Filtering by status, source, category, and date
- Evidence detail panel
- Direct links to public sources
- 8 actionable Checks / Watch Next items
- Related-evidence navigation

The final dataset also includes selected incident-escalation and timeline-conflict records covering the June 27 alert claim, July 7 restart timing, the July 9 external sandbox launchpad, and the disputed exact participant count.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Node.js
- Express
- TypeScript

### Data

The research dataset is stored as deterministic JSON files:

- `backend/src/data/events.json`
- `backend/src/data/sources.json`
- `backend/src/data/checks.json`

No database is required.

## Run Locally

### Backend

From the repository root:

    cd backend
    npm install
    npm run dev

The API runs at `http://localhost:3001`.

### Frontend

In another terminal:

    cd frontend
    npm install
    npm run dev

Open the local URL printed by Vite.

## API

Available endpoints:

- `GET /api/health`
- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/sources`
- `GET /api/sources/:id`
- `GET /api/checks`
- `GET /api/summary`

Event filtering is also supported through query parameters such as:

- `GET /api/events?status=Confirmed`
- `GET /api/events?category=Credential%20access`

## Evidence Base

The incident dataset uses six public sources from:

- OpenAI
- Hugging Face
- METR
- CeSIA

Labels represent the status of claims within the reviewed public record, not an assertion of ultimate ground truth. The research report additionally situates the project against incident catalogues, MITRE ATLAS, and structured analytic methods; those references are related work, not additional incident-evidence sources.

## Limitations

- The dataset is curated from six incident-specific public sources and classifications involve reviewer judgment.
- Public reports may be updated after this project's snapshot.
- Some events rely primarily on first-party incident reporting.
- Intent and motivation claims are inherently more uncertain than logged technical events.
- The dashboard does not attempt to reproduce exploit techniques or provide operational offensive instructions.

## Repository Structure

    apart-incident-dashboard/
    ├── backend/
    │   └── src/
    │       ├── data/
    │       │   ├── checks.json
    │       │   ├── events.json
    │       │   └── sources.json
    │       └── server.ts
    ├── frontend/
    │   └── src/
    └── README.md

## License

This project is released under the MIT License. See `LICENSE` for details.
