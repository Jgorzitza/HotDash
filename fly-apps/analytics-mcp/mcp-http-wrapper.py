#!/usr/bin/env python3
"""
HTTP wrapper for Google Analytics MCP Server on Fly.io
Provides HTTP/SSE transport for the MCP stdio server
Fixed version with persistent subprocess and proper session management
"""
import asyncio
import base64
import json
import os
import subprocess
import sys
import tempfile
from typing import Optional
import uuid

try:
    from aiohttp import web
except ImportError:
    print("Installing aiohttp...", file=sys.stderr)
    subprocess.check_call([sys.executable, "-m", "pip", "install", "aiohttp"])
    from aiohttp import web


class MCPSession:
    """Manages a single MCP subprocess session"""
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.process: Optional[asyncio.subprocess.Process] = None
        self.lock = asyncio.Lock()
        self.initialized = False
        
    async def start(self):
        """Start the MCP subprocess"""
        env = os.environ.copy()
        self.process = await asyncio.create_subprocess_exec(
            "analytics-mcp",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env
        )
        print(f"Session {self.session_id}: MCP process started", file=sys.stderr)
    
    async def send_request(self, request_data: dict) -> dict:
        """Send a request and get response"""
        async with self.lock:
            if not self.process or self.process.returncode is not None:
                await self.start()
            
            # Write request
            request_json = json.dumps(request_data) + "\n"
            self.process.stdin.write(request_json.encode())
            await self.process.stdin.drain()
            
            # Read response
            response_line = await asyncio.wait_for(
                self.process.stdout.readline(),
                timeout=30.0
            )
            
            if not response_line:
                raise Exception("No response from MCP server")
            
            response = json.loads(response_line.decode().strip())
            
            # Track if initialized
            if request_data.get("method") == "initialize" and "result" in response:
                self.initialized = True
                
            return response
    
    async def cleanup(self):
        """Cleanup the subprocess"""
        if self.process and self.process.returncode is None:
            try:
                self.process.terminate()
                await asyncio.wait_for(self.process.wait(), timeout=2.0)
            except:
                try:
                    self.process.kill()
                    await self.process.wait()
                except:
                    pass


class MCPHTTPWrapper:
    def __init__(self):
        self.auth_token = os.environ.get("MCP_AUTH_TOKEN", "")
        self.creds_file = None
        self.sessions = {}  # session_id -> MCPSession
        self._setup_credentials()

    def _setup_credentials(self):
        """Setup Google Cloud credentials from base64-encoded JSON"""
        creds_json_b64 = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
        if creds_json_b64:
            try:
                creds_json = base64.b64decode(creds_json_b64).decode('utf-8')
                self.creds_file = tempfile.NamedTemporaryFile(
                    mode='w',
                    suffix='.json',
                    delete=False
                )
                self.creds_file.write(creds_json)
                self.creds_file.flush()
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = self.creds_file.name
                print(f"Google credentials written to {self.creds_file.name}", file=sys.stderr)
            except Exception as e:
                print(f"Error setting up credentials: {e}", file=sys.stderr)

    def verify_auth(self, request: web.Request) -> bool:
        """Verify authentication token"""
        if not self.auth_token:
            return True
        auth_header = request.headers.get("Authorization", "")
        return auth_header == f"Bearer {self.auth_token}"

    async def health_check(self, request: web.Request) -> web.Response:
        """Health check endpoint"""
        return web.Response(text="OK")
    
    def get_or_create_session(self, session_id: Optional[str] = None) -> tuple[str, MCPSession]:
        """Get existing session or create new one"""
        if session_id and session_id in self.sessions:
            return session_id, self.sessions[session_id]
        
        # Create new session
        new_session_id = session_id or str(uuid.uuid4())
        session = MCPSession(new_session_id)
        self.sessions[new_session_id] = session
        return new_session_id, session

    async def handle_mcp_request(self, request: web.Request) -> web.StreamResponse:
        """Handle MCP requests via Server-Sent Events with session support"""
        if not self.verify_auth(request):
            return web.Response(text="Unauthorized", status=401)

        # Get or create session
        session_id = request.headers.get("X-MCP-Session-ID")
        session_id, session = self.get_or_create_session(session_id)
        
        # Set up SSE response
        response = web.StreamResponse()
        response.headers['Content-Type'] = 'text/event-stream'
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['Connection'] = 'keep-alive'
        response.headers['X-MCP-Session-ID'] = session_id
        await response.prepare(request)

        try:
            # Read request body
            body = await request.read()
            if not body:
                error_msg = json.dumps({"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}})
                await response.write(f"data: {error_msg}\n\n".encode())
                return response

            request_data = json.loads(body.decode())
            
            # Send request to MCP session
            mcp_response = await session.send_request(request_data)
            
            # Send as SSE event
            response_json = json.dumps(mcp_response)
            await response.write(f"data: {response_json}\n\n".encode())

        except asyncio.TimeoutError:
            error_msg = json.dumps({"jsonrpc": "2.0", "error": {"code": -32000, "message": "Request timeout"}})
            await response.write(f"data: {error_msg}\n\n".encode())
        except Exception as e:
            print(f"Error handling MCP request: {e}", file=sys.stderr)
            error_msg = json.dumps({"jsonrpc": "2.0", "error": {"code": -32603, "message": f"Internal error: {str(e)}"}})
            try:
                await response.write(f"data: {error_msg}\n\n".encode())
            except:
                pass

        finally:
            try:
                await response.write_eof()
            except:
                pass

        return response
    
    async def cleanup_sessions(self):
        """Cleanup all sessions"""
        for session in self.sessions.values():
            await session.cleanup()


async def init_app():
    """Initialize the web application"""
    wrapper = MCPHTTPWrapper()

    app = web.Application()
    app['mcp_wrapper'] = wrapper

    # Routes
    app.router.add_get('/health', wrapper.health_check)
    app.router.add_post('/mcp', wrapper.handle_mcp_request)
    app.router.add_get('/mcp', wrapper.handle_mcp_request)

    # Cleanup on shutdown
    async def cleanup(app):
        await wrapper.cleanup_sessions()
        if wrapper.creds_file:
            try:
                os.unlink(wrapper.creds_file.name)
                wrapper.creds_file.close()
            except Exception as e:
                print(f"Error cleaning up credentials file: {e}", file=sys.stderr)

    app.on_cleanup.append(cleanup)

    return app


def main():
    """Main entry point"""
    port = int(os.environ.get('PORT', 8080))

    print(f"Starting Google Analytics MCP HTTP wrapper on port {port}", file=sys.stderr)
    print(f"Google Cloud Project: {os.environ.get('GOOGLE_PROJECT_ID', 'NOT SET')}", file=sys.stderr)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    app = loop.run_until_complete(init_app())

    web.run_app(app, host='0.0.0.0', port=port)


if __name__ == '__main__':
    main()
