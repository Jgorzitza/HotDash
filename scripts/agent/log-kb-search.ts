import { logDecision } from '../../app/services/decisions.server.js';

async function logKBSearch() {
  try {
    await logDecision({
      scope: 'build',
      actor: 'integrations',
      action: 'kb_search_completed',
      rationale: 'KB search completed before starting task INTEGRATIONS-019',
      taskId: 'INTEGRATIONS-019',
      payload: {
        searchResults: 'Found 6 relevant results with 3 recommendations',
        recommendations: ['Review existing solutions', 'Check common issues', 'Review integration points'],
        sources: ['KB search results logged to kb-search-INTEGRATIONS-019-1761247287675.json']
      }
    });
    console.log('✅ KB search logged to database');
  } catch (error) {
    console.error('❌ Failed to log KB search:', error);
    process.exit(1);
  }
}

logKBSearch();
