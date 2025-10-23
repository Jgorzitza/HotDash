/**
 * KB INTEGRATION SERVICE
 * 
 * This service provides KB tool integration for all agents to search for
 * existing solutions, context, and documentation before executing tasks.
 * 
 * Prevents redoing work and ensures agents have full context.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface KBQueryResult {
  question: string;
  answer: string;
  sources: Array<{
    title: string;
    similarity: number;
  }>;
  timestamp: Date;
}

export interface KBContextSearch {
  taskId: string;
  taskTitle: string;
  searchQueries: string[];
  results: KBQueryResult[];
  recommendations: string[];
}

/**
 * Execute KB query using the pilot agent's KB tool
 */
export async function queryKB(question: string): Promise<KBQueryResult> {
  try {
    console.log(`🔍 [KB] Querying: ${question.substring(0, 100)}...`);
    
    // Set up environment variables for KB tool
    const env = {
      ...process.env,
      // Add any additional env vars needed for KB tool
    };
    
    // Execute the KB query command
    const { stdout, stderr } = await execAsync(
      `npm run dev-kb:query -- "${question.replace(/"/g, '\\"')}"`,
      { 
        env,
        cwd: process.cwd(),
        timeout: 30000 // 30 second timeout
      }
    );
    
    if (stderr && !stderr.includes('npm warn')) {
      console.warn(`[KB] Warning: ${stderr}`);
    }
    
    // Parse the output to extract answer and sources
    const lines = stdout.split('\n');
    let answer = '';
    let sources: Array<{ title: string; similarity: number }> = [];
    let inAnswer = false;
    let inSources = false;
    
    for (const line of lines) {
      if (line.includes('🧠 Question:')) {
        inAnswer = true;
        continue;
      }
      
      if (line.includes('🔎 Sources:')) {
        inAnswer = false;
        inSources = true;
        continue;
      }
      
      if (inAnswer && line.trim() && !line.includes('npm warn')) {
        answer += line + '\n';
      }
      
      if (inSources && line.includes('—')) {
        const match = line.match(/(.+?) — (.+?) \(similarity: ([\d.]+)\)/);
        if (match) {
          sources.push({
            title: match[1].trim(),
            similarity: parseFloat(match[3])
          });
        }
      }
    }
    
    return {
      question,
      answer: answer.trim(),
      sources,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error(`[KB] Error querying KB: ${error.message}`);
    return {
      question,
      answer: `KB query failed: ${error.message}`,
      sources: [],
      timestamp: new Date()
    };
  }
}

/**
 * Search for existing solutions and context before executing a task
 */
export async function searchTaskContext(
  taskId: string,
  taskTitle: string,
  taskDescription: string,
  assignedAgent: string
): Promise<KBContextSearch> {
  console.log(`🔍 [KB] Searching context for task: ${taskId} - ${taskTitle}`);
  
  // Generate search queries based on task content
  const searchQueries = generateSearchQueries(taskTitle, taskDescription, assignedAgent);
  
  // Execute all queries
  const results: KBQueryResult[] = [];
  for (const query of searchQueries) {
    try {
      const result = await queryKB(query);
      results.push(result);
      
      // Rate limiting: wait between queries
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[KB] Error with query "${query}": ${error.message}`);
    }
  }
  
  // Generate recommendations based on results
  const recommendations = generateRecommendations(results, taskId, taskTitle);
  
  return {
    taskId,
    taskTitle,
    searchQueries,
    results,
    recommendations
  };
}

/**
 * Generate relevant search queries for a task
 */
function generateSearchQueries(
  taskTitle: string,
  taskDescription: string,
  assignedAgent: string
): string[] {
  const queries: string[] = [];
  
  // 1. Direct task search
  queries.push(`How to implement ${taskTitle}? What are the steps and requirements?`);
  
  // 2. Agent-specific search
  queries.push(`What are the best practices for ${assignedAgent} agent when working on ${taskTitle}?`);
  
  // 3. Technical implementation search
  if (taskTitle.toLowerCase().includes('api')) {
    queries.push('API implementation patterns and best practices');
  }
  if (taskTitle.toLowerCase().includes('ui') || taskTitle.toLowerCase().includes('component')) {
    queries.push('UI component implementation and design patterns');
  }
  if (taskTitle.toLowerCase().includes('database') || taskTitle.toLowerCase().includes('db')) {
    queries.push('Database implementation patterns and security considerations');
  }
  
  // 4. Problem-solving search
  queries.push(`Common issues and solutions when implementing ${taskTitle}`);
  
  // 5. Integration search
  queries.push(`How does ${taskTitle} integrate with the Growth Engine architecture?`);
  
  return queries;
}

/**
 * Generate recommendations based on KB search results
 */
function generateRecommendations(
  results: KBQueryResult[],
  taskId: string,
  taskTitle: string
): string[] {
  const recommendations: string[] = [];
  
  // Check for existing solutions
  const hasExistingSolutions = results.some(r => 
    r.answer.toLowerCase().includes('solution') ||
    r.answer.toLowerCase().includes('implementation') ||
    r.answer.toLowerCase().includes('example')
  );
  
  if (hasExistingSolutions) {
    recommendations.push('✅ Found existing solutions in KB - review before implementing');
  }
  
  // Check for common issues
  const hasCommonIssues = results.some(r => 
    r.answer.toLowerCase().includes('issue') ||
    r.answer.toLowerCase().includes('problem') ||
    r.answer.toLowerCase().includes('challenge')
  );
  
  if (hasCommonIssues) {
    recommendations.push('⚠️ Found common issues in KB - review potential problems');
  }
  
  // Check for security considerations
  const hasSecurityInfo = results.some(r => 
    r.answer.toLowerCase().includes('security') ||
    r.answer.toLowerCase().includes('auth') ||
    r.answer.toLowerCase().includes('permission')
  );
  
  if (hasSecurityInfo) {
    recommendations.push('🔒 Found security considerations in KB - review security requirements');
  }
  
  // Check for integration points
  const hasIntegrationInfo = results.some(r => 
    r.answer.toLowerCase().includes('integration') ||
    r.answer.toLowerCase().includes('api') ||
    r.answer.toLowerCase().includes('workflow')
  );
  
  if (hasIntegrationInfo) {
    recommendations.push('🔗 Found integration points in KB - review system connections');
  }
  
  // Default recommendation
  if (recommendations.length === 0) {
    recommendations.push('📚 No specific recommendations found - proceed with standard implementation');
  }
  
  return recommendations;
}

/**
 * Log KB search results to DecisionLog
 */
export async function logKBSearch(
  taskId: string,
  searchResults: KBContextSearch,
  agent: string
): Promise<void> {
  try {
    const { logDecision } = await import('./decisions.server');
    
    await logDecision({
      scope: 'build',
      actor: agent,
      action: 'kb_search_completed',
      rationale: `KB search completed for task ${taskId}`,
      taskId,
      status: 'completed',
      payload: {
        taskTitle: searchResults.taskTitle,
        queriesExecuted: searchResults.searchQueries.length,
        resultsFound: searchResults.results.length,
        recommendations: searchResults.recommendations,
        sources: searchResults.results.flatMap(r => r.sources),
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`✅ [KB] Logged search results for task ${taskId}`);
  } catch (error) {
    console.error(`❌ [KB] Error logging search results: ${error.message}`);
  }
}

/**
 * Pre-task KB search workflow
 * This should be called before any task execution
 */
export async function preTaskKBSearch(
  taskId: string,
  taskTitle: string,
  taskDescription: string,
  assignedAgent: string
): Promise<KBContextSearch> {
  console.log(`\n🔍 [KB] PRE-TASK SEARCH: ${taskId} - ${taskTitle}`);
  console.log('='.repeat(80));
  
  // Perform KB search
  const searchResults = await searchTaskContext(
    taskId,
    taskTitle,
    taskDescription,
    assignedAgent
  );
  
  // Log results
  await logKBSearch(taskId, searchResults, assignedAgent);
  
  // Display results
  console.log(`\n📊 KB SEARCH RESULTS:`);
  console.log(`   Queries executed: ${searchResults.searchQueries.length}`);
  console.log(`   Results found: ${searchResults.results.length}`);
  console.log(`   Recommendations: ${searchResults.recommendations.length}`);
  
  console.log(`\n💡 RECOMMENDATIONS:`);
  searchResults.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });
  
  console.log(`\n📚 KEY SOURCES:`);
  const allSources = searchResults.results.flatMap(r => r.sources);
  const topSources = allSources
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
  
  topSources.forEach((source, i) => {
    console.log(`   ${i + 1}. ${source.title} (${source.similarity.toFixed(3)})`);
  });
  
  console.log('\n' + '='.repeat(80));
  
  return searchResults;
}
