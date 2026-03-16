# Flow Ride — Traffic Events

Full-stack geo-based traffic events app for Da Nang. Next.js (App Router), React, TypeScript, TailwindCSS, Mapbox GL JS, MongoDB (Mongoose), Mapbox Directions API.

## Run the project

1. **Copy environment file and configure**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and set all required variables (see below).

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Configure MongoDB

1. Install MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier).
2. Set `MONGODB_URI` in `.env.local`:
   - Local: `MONGODB_URI=mongodb://localhost:27017/flowride`
   - Atlas: `MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.xxxxx.mongodb.net/flowride?retryWrites=true&w=majority`

The app uses Mongoose with a single cached connection (avoids multiple connections on hot reload).

## Set Mapbox token

1. Create a [Mapbox account](https://account.mapbox.com/) and get an access token.
2. In `.env.local` set:
   - **MAPBOX_TOKEN** — used by the server for the Directions API (`/api/route`). Can be a secret token.
   - **NEXT_PUBLIC_MAPBOX_TOKEN** — used by the browser to render the map. Must be a public token (or the same token if you use one for both).

Without `NEXT_PUBLIC_MAPBOX_TOKEN` the map page will show a setup message. Without `MAPBOX_TOKEN` route building will fail with a server error.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes (for events) | MongoDB connection string |
| `MAPBOX_TOKEN` | Yes (for route) | Server-side Mapbox token for Directions API |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes (for map) | Client-side Mapbox token for map display |
| `NEXT_PUBLIC_API_URL` | No | API base URL; leave empty to use same app at `/api/*` |

## Pages

- **/** — Map: view events, tap to report, build route, see events along route
- **/report** — How to report an event
- **/about** — About the app

## Backend API (Route Handlers)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check, returns `{ "status": "ok" }` |
| GET | `/api/events` | List events. Query: `lat`, `lng`, `radius`, `city` |
| POST | `/api/events` | Create event. Body: `{ city?, type, lat, lng }` |
| POST | `/api/events/[id]/confirm` | Increment event confirmations |
| POST | `/api/route` | Get route. Body: `{ from: [lng, lat], to: [lng, lat] }` or `{ start: { lat, lng }, end: { lat, lng } }`. Returns `{ distance, duration, geometry, coordinates }` |

Events expire automatically ~3 hours after creation (TTL index). Geospatial queries use MongoDB `$near` and `$maxDistance` (meters).

## Project structure

```
app/            — routes (pages + API Route Handlers)
  api/          — backend: health, events, events/[id]/confirm, route
components/     — Map, EventMarker, RouteDrawer, ReportModal, EventPopup, MapControls
lib/            — types, constants, env, store, mongodb, mapbox
models/         — Event (Mongoose schema)
hooks/          — useEvents, useMap
services/       — client API: events, route
styles/         — reserved
```
