# Agent SDK Service Dockerfile
# Build context: /home/justin/HotDash/hot-dash (project root)

FROM node:20-slim

WORKDIR /app

# Copy package files
COPY apps/agent-service/package*.json ./apps/agent-service/
COPY apps/agent-service/tsconfig.json ./apps/agent-service/

# Copy source files
COPY apps/agent-service/src ./apps/agent-service/src

# Install dependencies (including devDependencies for build)
WORKDIR /app/apps/agent-service
RUN npm ci

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Create data directory for JSONL fallback
RUN mkdir -p data/approvals

# Expose port
EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8787/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

# Start server
CMD ["node", "dist/server.js"]

