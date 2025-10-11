# Dockerfile for Google Analytics MCP Server on Fly.io
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install pipx and analytics-mcp
RUN pip install --no-cache-dir pipx && \
    pipx install analytics-mcp && \
    pipx ensurepath

# Add pipx binaries to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Copy wrapper script for HTTP transport
COPY mcp-http-wrapper.py /app/mcp-http-wrapper.py

# Expose port for HTTP transport
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the HTTP wrapper that forwards to analytics-mcp
CMD ["python", "/app/mcp-http-wrapper.py"]
