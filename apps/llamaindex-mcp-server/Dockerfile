# LlamaIndex RAG MCP Server Dockerfile
# Build context: /home/justin/HotDash/hot-dash (project root)

FROM node:20-slim

WORKDIR /app

# Copy package files first for better caching
COPY apps/llamaindex-mcp-server/package*.json ./apps/llamaindex-mcp-server/
COPY apps/llamaindex-mcp-server/tsconfig.json ./apps/llamaindex-mcp-server/

# Copy source files
COPY apps/llamaindex-mcp-server/src ./apps/llamaindex-mcp-server/src

# Copy llama-workflow CLI (already built)
COPY scripts/ai/llama-workflow/dist ./scripts/ai/llama-workflow/dist
COPY scripts/ai/llama-workflow/package.json ./scripts/ai/llama-workflow/
COPY scripts/ai/llama-workflow/package-lock.json ./scripts/ai/llama-workflow/

# Install llama-workflow dependencies (CRITICAL: includes 'commander' needed by CLI)
WORKDIR /app/scripts/ai/llama-workflow
RUN npm ci --production

# Install MCP server dependencies (including devDependencies for build)
WORKDIR /app/apps/llamaindex-mcp-server
RUN npm ci

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

# Start server
CMD ["node", "dist/server.js"]
