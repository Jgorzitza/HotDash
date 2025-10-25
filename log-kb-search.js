const { execSync } = require('child_process');

try {
  execSync('npx tsx --env-file=.env -e "import { logDecision } from \'./app/services/decisions.server.js\'; await logDecision({ scope: \'build\', actor: \'ai-customer\', action: \'kb_search_completed\', rationale: \'KB search completed before starting task AI-CUSTOMER-001\', taskId: \'AI-CUSTOMER-001\', payload: { searchResults: \'Found 4 relevant results\', recommendations: [\'Review existing solutions\', \'Review common issues\'], sources: [\'kb-search-AI-CUSTOMER-001-1761247227012.json\'] } }); console.log(\'✅ KB search logged\');"', { stdio: 'inherit' });
} catch (error) {
  console.error('Error logging KB search:', error.message);
}
