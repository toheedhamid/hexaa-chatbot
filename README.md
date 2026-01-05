# Chatbot + n8n Workspace

## Structure
- `docker-compose.yml` — local stack (n8n, Redis, embeddings, React app).
- `react-chat-app/` — React frontend with admin pages (`/admin`, `/admin/metrics`).
- `n8n_data/` — n8n state and scripts (includes `scripts/test.js` for k6).
- `n8n_workflows/` — exported helper workflows (load test trigger, ReIndexNow).
- `docs/` — scaling, security, and n8n notes.

## Local Setup
1) `docker compose up --build` from `my-chat-project/`.
2) Frontend: http://localhost:3000 (proxied to n8n at 5678).
3) n8n: http://localhost:5678.
4) Environment (frontend):
   - `REACT_APP_N8N_BASE_URL` (default `http://localhost:5678`)
   - `REACT_APP_METRICS_SHEET_EMBED` (published Google Sheet embed URL)
   - `REACT_APP_METRICS_JSON_URL` (optional JSON view of metrics for tables)
5) k6 load test script: `n8n_data/scripts/test.js`. Example:
   - `docker compose exec n8n bash -lc "k6 run --vus 20 --duration 5m /home/node/.n8n/scripts/test.js"`

## Workflows
- `n8n_workflows/reindex-now-workflow.json` — webhook `/webhook/reindex-now` -> runs `NightlyIngest`.
- `n8n_workflows/load-test-workflow.json` — webhook `/webhook/run-load-test` -> Execute Command k6.
- See `docs/n8n-analytics-updates.md` for Google Sheets logging + PII masking + diff-crawl plan.

## Production Rollout (outline)
- Deploy n8n (e.g., Fly.io) with secrets: API keys, Sheets creds, `WEBHOOK_URL`, `SHEETS_METRICS_ID`, admin token.
- Deploy React build to static host (e.g., Vercel/Netlify). Set env vars above.
- Run smoke tests on `/webhook/answer`, `/webhook/estimate`, `/webhook/navigate` against production URLs.
- Record a short Loom (~5 min) showing chat + admin + metrics.

## Admin Pages
- `/admin` — trigger ReIndexNow webhook (optional `X-Admin-Token` header).
- `/admin/metrics` — embed Google Sheet and show table/rollups of metrics JSON.

## Future Improvements
- Add WCAG compliance checklist and automated accessibility scan (axe) in CI.
- Add auth guard for admin routes and VPN/IP allow-listing.

