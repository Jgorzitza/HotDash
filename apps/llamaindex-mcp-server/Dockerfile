# LlamaIndex RAG MCP Server Dockerfile
# Build context: /home/justin/HotDash/hot-dash (project root)

FROM node:20-slim

WORKDIR /app

# Copy package files and prebuilt dist
COPY apps/llamaindex-mcp-server/package*.json ./apps/llamaindex-mcp-server/
COPY apps/llamaindex-mcp-server/dist ./apps/llamaindex-mcp-server/dist

# Copy archived llama-workflow CLI (fallback bundle)
COPY docs/_archive/2025-10-15-prebundle/scripts/ai/llama-workflow ./docs/_archive/2025-10-15-prebundle/scripts/ai/llama-workflow

# Install runtime dependencies only
WORKDIR /app/apps/llamaindex-mcp-server
RUN npm install --omit=dev

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

# Start server
CMD ["node", "dist/server.js"]
