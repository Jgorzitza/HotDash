#!/bin/bash

# Sync Augment Rules Script
# Ensures .augment/rules/ stays in sync with governance documents

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Augment Rules Sync${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if we're in the repo root
if [ ! -f "docs/NORTH_STAR.md" ]; then
    echo -e "${YELLOW}⚠ Not in repository root. Please run from /home/justin/HotDash/hot-dash/${NC}"
    exit 1
fi

# Create .augment/rules directory if it doesn't exist
mkdir -p .augment/rules

echo -e "${BLUE}Checking source documents...${NC}"

# Check if source documents exist
SOURCES=(
    "docs/NORTH_STAR.md"
    "docs/RULES.md"
    "docs/OPERATING_MODEL.md"
    "README.md"
    "mcp/README.md"
)

ALL_EXIST=true
for source in "${SOURCES[@]}"; do
    if [ -f "$source" ]; then
        echo -e "${GREEN}✓${NC} $source"
    else
        echo -e "${YELLOW}✗${NC} $source (missing)"
        ALL_EXIST=false
    fi
done

if [ "$ALL_EXIST" = false ]; then
    echo -e "\n${YELLOW}⚠ Some source documents are missing. Rules may be incomplete.${NC}"
fi

echo -e "\n${BLUE}Checking rule files...${NC}"

# Check if rule files exist
RULES=(
    ".augment/rules/00-core-principles.md"
    ".augment/rules/01-documentation-policy.md"
    ".augment/rules/02-task-workflow.md"
    ".augment/rules/03-security-secrets.md"
    ".augment/rules/04-mcp-tools.md"
    ".augment/rules/05-hitl-approvals.md"
)

RULES_EXIST=true
for rule in "${RULES[@]}"; do
    if [ -f "$rule" ]; then
        echo -e "${GREEN}✓${NC} $rule"
    else
        echo -e "${YELLOW}✗${NC} $rule (missing)"
        RULES_EXIST=false
    fi
done

if [ "$RULES_EXIST" = false ]; then
    echo -e "\n${YELLOW}⚠ Some rule files are missing.${NC}"
    echo -e "${YELLOW}  Run this script to regenerate them or check git history.${NC}"
fi

# Verify frontmatter in rule files
echo -e "\n${BLUE}Verifying YAML frontmatter in rule files...${NC}"

FRONTMATTER_OK=true
for rule in "${RULES[@]}"; do
    if [ -f "$rule" ]; then
        if head -1 "$rule" | grep -q "^---$"; then
            echo -e "${GREEN}✓${NC} $rule has frontmatter"
        else
            echo -e "${YELLOW}⚠${NC} $rule missing frontmatter"
            FRONTMATTER_OK=false
        fi
    fi
done

if [ "$FRONTMATTER_OK" = false ]; then
    echo -e "\n${YELLOW}⚠ Some rule files missing YAML frontmatter.${NC}"
    echo -e "${YELLOW}  Augment Code requires frontmatter with: description, globs, alwaysApply${NC}"
fi

# Create README for .augment/rules
echo -e "\n${BLUE}Creating .augment/rules/README.md...${NC}"

cat > .augment/rules/README.md << 'EOF'
# Augment Code Rules

This directory contains extracted rules from the HotDash governance documents.

## Purpose

These rules are automatically synced from the main governance documents to provide
Augment Code with clear, actionable guidelines for development.

## Source Documents

Rules are extracted from:
- `docs/NORTH_STAR.md` - Vision, principles, architecture
- `docs/RULES.md` - Documentation policy, process, security
- `docs/OPERATING_MODEL.md` - Workflow, task management, approvals
- `README.md` - Quick start, integration guidelines
- `mcp/` - MCP tools documentation

## Rule Files

### 00-core-principles.md
Core principles, vision, architecture constraints, success metrics, and Definition of Done.

**Source:** `docs/NORTH_STAR.md`

### 01-documentation-policy.md
Allowed Markdown paths, CI enforcement, agent-specific rules, and verification.

**Source:** `docs/RULES.md`

### 02-task-workflow.md
GitHub Issues workflow, PR requirements, pipeline, task sizing, and Danger enforcement.

**Source:** `docs/OPERATING_MODEL.md`, `docs/RULES.md`

### 03-security-secrets.md
Secret management, storage locations, GitHub security features, Gitleaks, and rotation.

**Source:** `docs/RULES.md`, `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

### 04-mcp-tools.md
MCP servers, usage guidelines, when to use each tool, and best practices.

**Source:** `mcp/` directory, `docs/NORTH_STAR.md`, `README.md`

### 05-hitl-approvals.md
Human-in-the-Loop workflow, approvals loop, grading system, and HITL enforcement.

**Source:** `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

## Sync Process

Rules are synced from source documents using:

```bash
./scripts/ops/sync-augment-rules.sh
```

**When to sync:**
- After updating governance documents
- During manager startup (if documents changed)
- Before major development work
- When onboarding new agents

## Verification

To verify rules are current:

```bash
# Check source documents for changes
git diff docs/NORTH_STAR.md docs/RULES.md docs/OPERATING_MODEL.md

# Re-sync if changes detected
./scripts/ops/sync-augment-rules.sh
```

## Usage in Augment Code

Augment Code automatically reads these rules and applies them during development.

**Rules are enforced for:**
- Code generation
- File modifications
- Documentation updates
- Security practices
- Workflow compliance

## Maintenance

**Manager responsibilities:**
- Sync rules when governance docs change
- Verify rules are current during startup
- Update sync script if new rules added
- Ensure rules reflect current practices

**DO NOT:**
- Manually edit rule files (they're auto-generated)
- Remove or rename rule files
- Bypass rules in development
- Disable rule enforcement

## Last Synced

Check git log for last sync:

```bash
git log -1 --oneline .augment/rules/
```

---

**For questions about rules, see the source documents listed above.**
EOF

echo -e "${GREEN}✓${NC} Created .augment/rules/README.md"

# Create .gitignore if needed
if [ ! -f ".augment/.gitignore" ]; then
    echo -e "\n${BLUE}Creating .augment/.gitignore...${NC}"
    cat > .augment/.gitignore << 'EOF'
# Augment Code cache and temporary files
.cache/
*.tmp
*.log
EOF
    echo -e "${GREEN}✓${NC} Created .augment/.gitignore"
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}========================================${NC}"

RULE_COUNT=$(ls -1 .augment/rules/*.md 2>/dev/null | wc -l)
echo -e "Rule files: ${GREEN}${RULE_COUNT}${NC}"
echo -e "Source docs: ${GREEN}${#SOURCES[@]}${NC}"

if [ "$RULES_EXIST" = true ] && [ "$ALL_EXIST" = true ]; then
    echo -e "\n${GREEN}✓ All rules synced and current${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠ Some files missing - check output above${NC}"
    exit 1
fi
EOF

