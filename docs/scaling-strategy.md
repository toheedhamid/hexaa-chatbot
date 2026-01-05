# Scaling Strategy (Fly.io Machines)

## Goals
- Keep latency stable during traffic spikes.
- Avoid runaway spend by scaling down quickly.
- Keep the chatbot and n8n flows responsive while embeddings/Redis stay healthy.

## Fly.io Machines Auto-Scaling
- Auto-scaling watches VM metrics and automatically starts/stops machines.
- Recommended trigger: CPU > 80% for 3–5 minutes _or_ 95th percentile latency > 1.5s.
- Scale step: add 1 machine at a time; cap at 3× the normal count to control cost.
- Cooldown: wait 5–10 minutes before a new scaling decision to avoid flapping.
- Scale-down: when CPU < 40% and p95 latency < 800ms for 10 minutes, remove 1 machine.
- Pin one machine as “primary” for scheduled jobs (NightlyIngest) so they never vanish.

## Target Metrics & Alerts
- API p95 latency < 1.5s (answer/estimate webhooks).
- Error rate < 1% (5xx + timeouts).
- Redis CPU < 70%, memory < 70%.
- Embedding service p95 < 800ms; queue depth < 20 pending requests.
- n8n worker queue depth < 10 and execution duration < 30s at p95.
- Alerts: page at p95 latency > 2.5s for 5 minutes or error rate > 5% for 2 minutes.

## Capacity Plan
- Baseline: 1 machine each for n8n, React (static), Redis, embeddings.
- Burst: allow n8n + embeddings to scale to 3 machines; keep Redis single with 1 replica candidate.
- Place Redis on larger memory-optimized machine; keep embeddings CPU-optimized.
- Run k6 load test weekly after deploys to recalibrate thresholds.

## Deployment & Rollout
- Use Fly.io Machines rolling deploy with health checks on `/health` for webhooks.
- Warm up embeddings by pre-loading model on boot; fail readiness until loaded.
- Keep migrations and NightlyIngest on a single pinned machine to avoid duplicate runs.
- Use Fly secrets for API keys; never bake keys into images.

## Observability
- Centralize logs (n8n, webhooks, embeddings) to a log drain.
- Export metrics to Prometheus-compatible sink; visualize p95 latency, error rate, queue depth, CPU, memory.
- Track scaling events vs. traffic to refine thresholds.

## Playbooks
- Spike handling: scale n8n and embeddings by +1 manually if queue depth > 25 while autoscaler catches up.
- Redis pressure: flush old chat history keys; increase memory or enable eviction policy `allkeys-lru`.
- Slow ingest: pause NightlyIngest, run ReIndexNow after tuning batch size. 






