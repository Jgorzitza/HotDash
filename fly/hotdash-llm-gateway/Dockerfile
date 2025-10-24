# syntax=docker/dockerfile:1.7

# Re-use the official Langfuse images to avoid rebuilding the entire Next.js stack
FROM langfuse/langfuse:3 AS langfuse_web
FROM langfuse/langfuse-worker:3 AS langfuse_worker

# Final runtime image extends the Langfuse web image so we preserve the
# Node.js/Next.js runtime dependencies and entrypoint scripts that ship with
# the upstream container. We install Python and LiteLLM into this image and
# copy the Langfuse worker bundle so that a single Fly image can power all
# required processes (gateway, UI, worker).
FROM langfuse/langfuse:3 AS runtime

USER root
WORKDIR /app

# Install system deps for LiteLLM, Redis client, curl (health checks) and bash
RUN apk add --no-cache \
      python3 \
      py3-pip \
      bash \
      curl \
      tzdata \
      redis

# Create a dedicated virtualenv for LiteLLM to keep the Python footprint tidy
RUN python3 -m venv /opt/litellm
ENV PATH="/opt/litellm/bin:${PATH}"

# LiteLLM proxy + extras we rely on (async Redis + uvicorn)
RUN pip install --no-cache-dir \
      "litellm[proxy]==1.41.6" \
      "redis[async]==5.0.1" \
      "uvicorn[standard]==0.22.0" \
      "gunicorn==22.0.0"

# Copy the Langfuse worker artefacts so we can run it as an additional Fly process
COPY --from=langfuse_worker /app /opt/langfuse-worker

# Application assets and helper scripts live under /app inside the container.
# They are added later once the local repo content is copied in the build.

# Switch back to the non-root "nextjs" user expected by the upstream image.
USER nextjs
WORKDIR /app

# Copy repo artefacts (start scripts + LiteLLM config). We rely on the runtime
# image already containing the built Langfuse app under /app/web.
COPY --chown=nextjs:nodejs bin/ ./bin/
COPY --chown=nextjs:nodejs config/ ./config/

# Ensure scripts are executable before runtime selection via Fly processes.
USER root
RUN chmod +x /app/bin/*.sh
USER nextjs

# All processes rely on PORT provided by Fly. We keep the upstream entrypoint
# (dumb-init + shell scripts) and override the command per-process in fly.toml.
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["echo 'Specify process command in fly.toml' && sleep 3600"]
