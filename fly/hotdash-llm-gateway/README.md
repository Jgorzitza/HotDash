# HotDash LLM Gateway

This directory contains the Fly.io deployment assets for the `hotdash-llm-gateway` application. The gateway combines the following services:

- **LiteLLM Gateway (`gateway` process, port 4000)** – provides an OpenAI-compatible API surface with caching, quotas, and observability hooks.
- **Langfuse UI (`ui` process, port 3000)** – offers traces, cost analytics, and monitoring dashboards for all LLM traffic routed through the gateway.
- **Langfuse Worker (`worker` process, port 3030)** – ingests telemetry asynchronously and writes analytics to ClickHouse/MinIO.
- **Fly Redis (`hotdash-llm-cache`)** – managed cache powering LiteLLM exact and semantic caching.
- **Fly ClickHouse (`hotdash-langfuse-clickhouse`)** – dedicated analytics store required by Langfuse v3.
- **Fly MinIO (`hotdash-langfuse-minio`)** – S3-compatible object storage for Langfuse event/media archives.

## Layout

```
fly/hotdash-llm-gateway/
├── Dockerfile                  # Multi-service image (LiteLLM + Langfuse web + worker)
├── fly.toml                    # Fly multi-process configuration and services
├── bin/
│   ├── start-langfuse.sh         # Boots Langfuse UI process
│   ├── start-langfuse-worker.sh  # Boots Langfuse ingestion worker
│   └── start-litellm.sh          # Boots LiteLLM gateway process
├── config/
│   └── litellm.config.yaml       # LiteLLM proxy configuration (models, quotas, cache)
├── clickhouse/
│   └── fly.toml                  # Fly app for ClickHouse (private networking only)
└── minio/
    └── fly.toml                  # Fly app for MinIO (private networking only)
```

## Deployment Overview

1. **Secrets** – Populate `vault/hotrodan/llm-gateway-secrets.json` with generated credentials (LiteLLM master & team keys, Langfuse keys, Supabase URLs, Redis URL, ClickHouse + MinIO credentials, etc.) and sync them to the appropriate Fly apps using `fly secrets set` (see runbooks for exact commands per app).
2. **Database Prep** – Ensure the `langfuse` schema exists inside the shared Supabase instance, then deploy the ClickHouse and MinIO apps so Langfuse migrations can reach both services over the Fly private network.
3. **Caching** – Provision the managed Fly Redis instance `hotdash-llm-cache` in region `ord`; export its URL as `REDIS_URL` for the gateway process.
4. **Deploy Supporting Apps** – Deploy ClickHouse and MinIO via `fly deploy -c clickhouse/fly.toml` and `fly deploy -c minio/fly.toml`, then create required databases/buckets (covered in the deployment runbook).
5. **Deploy Gateway** – Run `fly deploy -a hotdash-llm-gateway` from this directory. Fly Machines will launch the `gateway`, `ui`, and `worker` processes from the same image.
6. **DNS & Certs** – Attach TLS certs for `gateway.hotrodan.com` and `langfuse.hotrodan.com`, then update DNS records as instructed by Fly.

Refer to the runbooks in `docs/runbooks/llm-gateway-*.md` for cutover, monitoring, and testing procedures.
