---
epoch: 2025.10.E1
doc: docs/NORTH_STAR.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# North Star — Operator Control Center

Deliver a trustworthy, operator-first control center embedded inside Shopify Admin that unifies CX, sales, SEO/content, social, and inventory into actionable tiles with agent-assisted approvals. Evidence or no merge.

## Development Principles

**MCP-First Development** — All code work must reference the latest tools, patterns, and examples from our available MCP servers (Shopify, Context7, GitHub, Supabase, Fly, Google Analytics, LlamaIndex RAG). **Agent training data is outdated for React Router 7 (contains v6/Remix patterns) and Shopify APIs (2023 or older).** Agents must verify current syntax before implementation - never trust training data for RR7 loaders, Shopify GraphQL, or Shopify App Bridge. Before implementing features, agents search HotDash codebase first (grep), then verify with appropriate MCP tools using conservative token limits (800-1500). All Shopify queries must be validated with Shopify MCP. All React Router 7 patterns must be verified with Context7. Google Analytics integration uses direct API (not MCP) for application data fetching. LlamaIndex RAG capabilities exposed via MCP server for universal agent access. This ensures we use current APIs, avoid deprecated patterns, maintain type safety, and stay aligned with 2024 best practices.
