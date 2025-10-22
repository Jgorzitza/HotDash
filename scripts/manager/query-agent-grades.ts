#!/usr/bin/env tsx
/**
 * Query agent self-grades and retrospectives from shutdown entries
 * 
 * Usage: npx tsx --env-file=.env scripts/manager/query-agent-grades.ts [agent-name]
 */

import 'dotenv/config';
import prisma from '../../app/db.server';
import { Prisma } from '@prisma/client';

async function queryAgentGrades(agentName?: string) {
  console.log('📊 Querying Agent Self-Grades & Retrospectives\n');
  console.log('='.repeat(80));
  
  const where: any = {
    action: 'shutdown',
    payload: { not: Prisma.JsonNull }
  };
  
  if (agentName) {
    where.actor = agentName.toLowerCase();
    console.log(`\nFiltering for agent: ${agentName}\n`);
  }
  
  const shutdowns = await prisma.decisionLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  
  if (shutdowns.length === 0) {
    console.log('\n⚪ No shutdown entries with self-grades found.\n');
    console.log('💡 Agents should include selfGrade and retrospective in shutdown payload.\n');
    return;
  }
  
  console.log(`\nFound ${shutdowns.length} shutdown entries:\n`);
  
  shutdowns.forEach((entry, i) => {
    const payload = entry.payload as any;
    const date = entry.createdAt.toISOString().split('T')[0];
    
    console.log(`${i + 1}. ${entry.actor.toUpperCase()} - ${date}`);
    
    if (payload?.selfGrade) {
      const grade = payload.selfGrade;
      console.log(`   📊 Self-Grade (Avg: ${grade.average || 'N/A'}):`);
      console.log(`      Progress: ${grade.progress || 'N/A'}/5`);
      console.log(`      Evidence: ${grade.evidence || 'N/A'}/5`);
      console.log(`      Alignment: ${grade.alignment || 'N/A'}/5`);
      console.log(`      Tool Discipline: ${grade.toolDiscipline || 'N/A'}/5`);
      console.log(`      Communication: ${grade.communication || 'N/A'}/5`);
    }
    
    if (payload?.retrospective) {
      const retro = payload.retrospective;
      if (retro.didWell?.length > 0) {
        console.log(`   ✅ Did Well:`);
        retro.didWell.forEach((item: string) => console.log(`      - ${item}`));
      }
      if (retro.toChange?.length > 0) {
        console.log(`   🔄 To Change:`);
        retro.toChange.forEach((item: string) => console.log(`      - ${item}`));
      }
      if (retro.toStop) {
        console.log(`   🛑 To Stop: ${retro.toStop}`);
      }
    }
    
    if (payload?.tasksCompleted) {
      console.log(`   ✅ Completed: ${payload.tasksCompleted.join(', ')}`);
    }
    
    if (payload?.hoursWorked) {
      console.log(`   ⏱️  Hours: ${payload.hoursWorked}h`);
    }
    
    console.log('');
  });
  
  console.log('='.repeat(80));
  
  // Calculate average grades across all shutdowns
  const gradesWithAvg = shutdowns
    .map(s => (s.payload as any)?.selfGrade?.average)
    .filter(avg => avg !== undefined && avg !== null);
  
  if (gradesWithAvg.length > 0) {
    const overallAvg = gradesWithAvg.reduce((sum, avg) => sum + avg, 0) / gradesWithAvg.length;
    console.log(`\n📈 Overall Performance:`);
    console.log(`   Average Self-Grade: ${overallAvg.toFixed(1)}/5.0`);
    console.log(`   Entries with grades: ${gradesWithAvg.length}/${shutdowns.length}`);
  }
  
  await prisma.$disconnect();
}

const agentName = process.argv[2];
queryAgentGrades(agentName).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

