# HotDash LLM Gateway

This directory contains the Fly.io deployment assets for the `hotdash-llm-gateway` application. The gateway combines three core services within a single Fly app:

- **LiteLLM Gateway (`gateway` process, port 4000)** – provides an OpenAI-compatible API surface with caching, quotas, and observability hooks.
- **Langfuse UI (`ui` process, port 3000)** – offers traces, cost analytics, and monitoring dashboards for all LLM traffic routed through the gateway.
- **Fly Redis (`hotdash-llm-cache`)** – supplies a managed Redis instance used by LiteLLM for both exact and semantic caching layers.

## Layout

```
fly/hotdash-llm-gateway/
├── Dockerfile                # Multi-service image (LiteLLM + Langfuse)
├── fly.toml                  # Fly multi-process configuration and services
├── bin/
│   ├── start-langfuse.sh     # Boots Langfuse UI process
│   └── start-litellm.sh      # Boots LiteLLM gateway process
└── config/
    └── litellm.config.yaml   # LiteLLM proxy configuration (models, quotas, cache)
```

## Deployment Overview

1. **Secrets** – Populate `vault/hotrodan/llm-gateway-secrets.json` with generated keys (LiteLLM master key, team API keys, Langfuse secrets, Supabase URLs, Redis URL, etc.) and sync them to Fly with `fly secrets set`.
2. **Database** – Ensure the `langfuse` schema exists inside the shared Supabase instance and apply Langfuse migrations on first boot (automatically handled by the Langfuse entrypoint).
3. **Caching** – Provision the managed Fly Redis instance `hotdash-llm-cache` in region `ord`; export its URL as `REDIS_URL`.
4. **Deploy** – Run `fly deploy -a hotdash-llm-gateway` from this directory. Fly Machines will launch two processes (`gateway`, `ui`) from the same image.
5. **DNS & Certs** – Attach TLS certs for `gateway.hotrodan.com` and `langfuse.hotrodan.com` and update DNS records as instructed by Fly.

Refer to the runbooks in `docs/runbooks/llm-gateway-*.md` for cutover, monitoring, and testing procedures.
