#!/bin/bash
# Start Context7 MCP server for HotDash project
# This script starts the Context7 Docker container with the correct configuration

set -e

PROJECT_ROOT="/home/justin/HotDash/hot-dash"
CONTAINER_NAME="context7-mcp"
PORT="3001"

echo "Starting Context7 MCP server..."

# Stop and remove existing container if it exists
docker rm -f $CONTAINER_NAME 2>/dev/null || true

# Start the container
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:8080 \
  -v "$PROJECT_ROOT:/workspace" \
  -e WORKSPACE_PATH=/workspace \
  -e MCP_TRANSPORT=http \
  -e PORT=8080 \
  --restart unless-stopped \
  mcp/context7

# Wait for container to be ready
sleep 2

# Check if container is running
if docker ps | grep -q $CONTAINER_NAME; then
    echo "✅ Context7 MCP server started successfully"
    echo "   Container: $CONTAINER_NAME"
    echo "   Port: $PORT"
    echo "   URL: http://localhost:$PORT/mcp"
    echo "   Workspace: $PROJECT_ROOT"
    echo ""
    echo "Logs:"
    docker logs $CONTAINER_NAME
else
    echo "❌ Failed to start Context7 MCP server"
    echo "Logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

