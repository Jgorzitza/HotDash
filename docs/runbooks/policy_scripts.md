# Policy Scripts Usage Guide

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Documentation for policy enforcement and monitoring scripts

## Overview

Policy scripts provide guardrails and monitoring for agent execution. All scripts are located in:

- `scripts/policy/` - Core policy enforcement scripts
- `tools/policy/` - Policy wrapper utilities

## Scripts

### 1. with-heartbeat.sh

**Location**: `scripts/policy/with-heartbeat.sh`  
**Purpose**: Wraps long-running commands with start/end logging for monitoring  
**Usage**:

```bash
./scripts/policy/with-heartbeat.sh <command> [args...]
```

**Example**:

```bash
./scripts/policy/with-heartbeat.sh npm run test:ci
```

**Output**: Creates NDJSON log file in `artifacts/heartbeat/foreground-TIMESTAMP.ndjson` with:

- Start event: `{"event":"start","timestamp":"...","command":"..."}`
- Command output (tee'd to file)
- End event: `{"event":"end","timestamp":"...","exit_code":N}`

**Environment Variables**:

- `HEARTBEAT_DIR` - Override heartbeat output directory (default: `artifacts/heartbeat`)

---

### 2. check-contracts.mjs

**Location**: `scripts/policy/check-contracts.mjs`  
**Purpose**: Verifies contract test resources exist for an agent's direction file  
**Usage**:

```bash
AGENT=<agent-name> node scripts/policy/check-contracts.mjs
# OR
node scripts/policy/check-contracts.mjs --agent=<agent-name>
```

**Example**:

```bash
AGENT=devops node scripts/policy/check-contracts.mjs
```

**What it does**:

1. Reads `docs/directions/<agent>.md`
2. Finds the `## Contract Test` section
3. Extracts contract test command(s)
4. Parses file paths referenced in commands
5. Verifies all referenced files exist
6. Exits 0 if all present, 1 if any missing

**Auto-detection**: If no agent specified, attempts to detect based on today's feedback file

**Output**:

- `✅ <path>` - Resource exists
- `❌ Missing: <path>` - Resource missing
- `ℹ️  <agent>: Command "..." does not reference explicit paths` - No paths to check

---

### 3. run_with_gates.sh

**Location**: `tools/policy/run_with_gates.sh`  
**Purpose**: Wraps commands with policy check gates  
**Usage**:

```bash
./tools/policy/run_with_gates.sh "<command string>"
```

**Example**:

```bash
./tools/policy/run_with_gates.sh "npm run build"
```

**Policy Checks Run** (non-blocking in local mode):

1. `check-docs.mjs` - Docs policy enforcement
2. `check-ai-config.mjs` - AI agent config validation
3. `check-branch.sh` - Branch naming verification
4. `check-diff-scope.sh` - Diff scope validation
5. `block-env-keys.sh` - Environment key leak prevention

**Output**: JSON events with timestamps for gate start/end, plus policy check results

---

## Workflow Integration

### CI/CD Usage

```yaml
# In GitHub Actions
- name: Run tests with heartbeat
  run: ./scripts/policy/with-heartbeat.sh npm run test:ci

- name: Verify contracts
  run: AGENT=engineer node scripts/policy/check-contracts.mjs
```

### Local Development

```bash
# Wrap long operations
./scripts/policy/with-heartbeat.sh npm install

# Run with all policy gates
./tools/policy/run_with_gates.sh "npm run lint"
```

### Agent Execution

Agents should use these scripts when:

- Running long operations that need monitoring (use `with-heartbeat.sh`)
- Verifying contract test resources (use `check-contracts.mjs`)
- Enforcing policy compliance (use `run_with_gates.sh`)

---

## Testing

All scripts tested on 2025-10-19:

| Script              | Test Command                                           | Result  |
| ------------------- | ------------------------------------------------------ | ------- |
| with-heartbeat.sh   | `./scripts/policy/with-heartbeat.sh echo "test"`       | ✅ PASS |
| check-contracts.mjs | `AGENT=devops node scripts/policy/check-contracts.mjs` | ✅ PASS |
| run_with_gates.sh   | `./tools/policy/run_with_gates.sh "echo 'test'"`       | ✅ PASS |

---

## Troubleshooting

**Issue**: `permission denied` error  
**Solution**: Ensure scripts are executable: `chmod +x scripts/policy/*.sh tools/policy/*.sh`

**Issue**: `check-contracts.mjs` can't detect agent  
**Solution**: Set `AGENT` environment variable or pass `--agent=<name>`

**Issue**: Heartbeat logs not created  
**Solution**: Check `HEARTBEAT_DIR` exists or will be auto-created; verify write permissions

---

## Maintenance

- **Owner**: DevOps agent
- **Review frequency**: Quarterly or when policy changes
- **Dependencies**: Node.js 20+, bash 4+, standard Unix tools (tee, date)
- **Related docs**: `docs/RULES.md`, `docs/OPERATING_MODEL.md`
