#!/usr/bin/env python3
import re, sys
msg = open(sys.argv[1], 'r', encoding='utf-8').read().strip()
pat = re.compile(r'^(feat|fix|docs|style|refactor|perf|test|chore|revert)(\([^)]+\))?: .+')
if not pat.match(msg):
    print('Commit message must follow Conventional Commits, e.g., "feat(dashboard): add metrics panel"')
    sys.exit(1)
