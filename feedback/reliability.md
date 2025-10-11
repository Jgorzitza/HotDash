---
epoch: 2025.10.E1
doc: feedback/$(basename "$file")
owner: $(basename "$file" .md)
last_reviewed: 2025-10-14
doc_hash: TBD
expires: 2025-10-21
---

<!-- Log new updates below. Include timestamp, command/output, and evidence path. -->

# HotDash Reliability Sprint Evidence Log
- Started: 2025-10-11T01:01:50Z
- Branch: agent/ai/staging-push
- Commit: 1890b25

## Conventions
- All timestamps UTC in ISO8601.
- Commands are prefixed by $ and outputs captured verbatim.
- Sensitive values are redacted in the log; raw secrets live only under vault/.

[2025-10-11T01:13:37Z] $ node -v
v24.9.0
[2025-10-11T01:13:41Z] $ npm -v
npm warn Unknown project config "[REDACTED]". This will stop working in the next major version of npm.
npm warn Unknown project config "[REDACTED]". This will stop working in the next major version of npm.
npm warn Unknown project config "[REDACTED]". This will stop working in the next major version of npm.
11.6.1
[2025-10-11T01:13:45Z] $ jq --version
jq-1.7
[2025-10-11T01:13:49Z] $ rg --version
scripts/[REDACTED].sh: line 16: rg: command not found
[2025-10-11T01:13:53Z] Installing ripgrep
[2025-10-11T01:41:26Z] $ rg --version
ripgrep 14.1.0

features:-simd-accel,+pcre2
simd(compile):+SSE2,-SSSE3,-AVX2
simd(runtime):+SSE2,+SSSE3,+AVX2

PCRE2 10.42 is available (JIT is available)
[2025-10-11T01:41:30Z] $ psql --version
psql (PostgreSQL) 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
[2025-10-11T01:41:35Z] $ docker --version
Docker version 28.5.1, build e180ab8
