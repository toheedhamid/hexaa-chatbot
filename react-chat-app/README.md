# React Chat App

Frontend for the chatbot and admin tools. Built with CRA.

## Env Vars
- `REACT_APP_N8N_BASE_URL` (default `http://localhost:5678`)
- `REACT_APP_METRICS_SHEET_EMBED` — published Google Sheet embed URL for metrics.
- `REACT_APP_METRICS_JSON_URL` — optional JSON feed (e.g., Sheets → published JSON) for the metrics table.

## Scripts
- `npm start` — dev server (proxy to n8n at port 5678).
- `npm run build` — production build.
- `npm test` — CRA test runner.

## Routes
- `/` — main chat UI.
- `/admin` — trigger ReIndexNow webhook (supports `X-Admin-Token` header).
- `/admin/metrics` — embeds Google Sheet and shows a simple table/rollups from JSON.

## Deployment
- Build and host on a static provider (Vercel/Netlify/Fly static).
- Configure the env vars above; protect `/admin` and `/admin/metrics` (VPN/basic auth/IP allow-list).
