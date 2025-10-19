# Lanes File Format Specification

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Define the structure and usage of manager lanes files

## Overview

Lanes files track molecule-level tasks for all agents in a centralized JSON structure. The manager uses this file to coordinate agent execution and monitor progress.

**Location**: `reports/manager/lanes/<YYYY-MM-DD>.json`  
**Latest pointer**: `reports/manager/lanes/latest.json` (references current date file)

## File Structure

```json
{
  "date": "YYYY-MM-DD",
  "version": "1.0",
  "description": "Human-readable description",
  "priority_order": ["P0", "P1", "P2", "P3"],
  "lanes": [
    {
      "agent": "agent-name",
      "priority": "P0|P1|P2|P3",
      "molecules": ["M-001", "M-002", "..."],
      "status": "pending|in_progress|blocked|completed",
      "completed": ["M-001"],
      "blocked": ["M-002"]
    }
  ],
  "metadata": {
    "total_agents": 17,
    "total_molecules": 100,
    "p0_molecules": 25,
    "created_at": "ISO-8601-timestamp",
    "created_by": "agent-name"
  }
}
```

## Field Definitions

### Root Level

| Field            | Type   | Required | Description                        |
| ---------------- | ------ | -------- | ---------------------------------- |
| `date`           | string | Yes      | Date in YYYY-MM-DD format          |
| `version`        | string | Yes      | Lanes file format version          |
| `description`    | string | No       | Human-readable description         |
| `priority_order` | array  | Yes      | Priority levels in execution order |
| `lanes`          | array  | Yes      | Array of agent lane objects        |
| `metadata`       | object | Yes      | Summary statistics                 |

### Lane Object

| Field       | Type   | Required | Description                                     |
| ----------- | ------ | -------- | ----------------------------------------------- |
| `agent`     | string | Yes      | Agent name (matches direction file)             |
| `priority`  | string | Yes      | P0 (critical), P1 (high), P2 (medium), P3 (low) |
| `molecules` | array  | Yes      | List of molecule IDs for this agent             |
| `status`    | string | Yes      | Current lane status                             |
| `completed` | array  | Yes      | List of completed molecule IDs                  |
| `blocked`   | array  | Yes      | List of blocked molecule IDs                    |

### Status Values

- `pending` - Not started
- `in_progress` - Active execution
- `blocked` - Cannot proceed due to dependencies
- `completed` - All molecules complete

### Priority Levels

- **P0** - Critical, blocks other agents, execute immediately
- **P1** - High priority, execute after P0
- **P2** - Medium priority, standard execution order
- **P3** - Low priority, execute when capacity available

## Molecule ID Conventions

Molecule IDs use the format: `<AGENT-PREFIX>-<NUMBER>`

**Examples**:

- DevOps: `D-001`, `D-002`, ... `D-018`
- Engineer: `E-001`, `E-002`, ... `E-999`
- QA: `Q-001`, `Q-002`, ... `Q-999`

**Agent Prefixes**:

- D = DevOps
- E = Engineer
- Q = QA
- P = Product
- A = Analytics / Ads (context-dependent)
- DA = Data
- S = SEO / Support (context-dependent)
- C = Content
- AI = AI-Customer / AI-Knowledge (context-dependent)
- INV = Inventory
- INT = Integrations
- DES = Designer
- PIL = Pilot
- M = Manager

## Usage

### Manager Workflow

1. **Morning**: Review lanes file for today's priorities
2. **During Day**: Update completed/blocked arrays as agents report
3. **Evening**: Generate next day's lanes file based on progress

### Agent Workflow

1. Read own lane from `reports/manager/lanes/latest.json`
2. Execute molecules in order
3. Report completion/blockers in feedback file
4. Manager updates lanes file based on feedback

### Updating the File

**Add completed molecule**:

```bash
jq '.lanes[] | select(.agent == "devops") | .completed += ["D-005"]' lanes.json
```

**Add blocked molecule**:

```bash
jq '.lanes[] | select(.agent == "devops") | .blocked += ["D-002"]' lanes.json
```

**Update status**:

```bash
jq '.lanes[] | select(.agent == "devops") | .status = "in_progress"' lanes.json
```

## Validation

**JSON Syntax**:

```bash
jq . reports/manager/lanes/2025-10-19.json
```

**All agents present**:

```bash
jq '.lanes | length' reports/manager/lanes/2025-10-19.json
# Should return 17
```

**Priority distribution**:

```bash
jq '[.lanes[] | .priority] | group_by(.) | map({key: .[0], count: length})' lanes.json
```

## Examples

### Complete DevOps Lane

```json
{
  "agent": "devops",
  "priority": "P0",
  "molecules": ["D-001", "D-002", "D-003", "D-004", "D-005"],
  "status": "in_progress",
  "completed": ["D-001", "D-004"],
  "blocked": ["D-002", "D-003"]
}
```

### Empty Lane (Pending Work)

```json
{
  "agent": "designer",
  "priority": "P3",
  "molecules": [],
  "status": "pending",
  "completed": [],
  "blocked": []
}
```

## Maintenance

- **Owner**: Manager agent (with DevOps support)
- **Update frequency**: Daily (end of day for next day)
- **Archive**: Keep 30 days of lanes files
- **Validation**: Run `jq` validation before committing changes

## Related Documentation

- Direction files: `docs/directions/*.md`
- Feedback files: `feedback/*/*.md`
- Agent workflow: `docs/OPERATING_MODEL.md`
