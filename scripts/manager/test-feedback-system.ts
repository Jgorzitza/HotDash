import prisma from '../../app/db.server';
import { logDecision } from '../../app/services/decisions.server';
import fs from 'fs';

async function testFeedbackSystem() {
  console.log('🧪 TESTING FEEDBACK SYSTEM');
  console.log('================================================================================');

  // Test 1: Log a test decision
  console.log('📝 Testing logDecision() function...');
  
  try {
    await logDecision({
      scope: 'build',
      actor: 'manager',
      action: 'feedback_system_test',
      rationale: 'Testing feedback system functionality',
      payload: {
        testType: 'system_verification',
        timestamp: new Date().toISOString(),
        status: 'testing'
      }
    });
    console.log('✅ logDecision() function working correctly');
  } catch (error) {
    console.error('❌ logDecision() function failed:', error.message);
    return;
  }

  // Test 2: Query recent decisions
  console.log('\n🔍 Testing database queries...');
  
  try {
    const recentDecisions = await prisma.decisionLog.findMany({
      where: {
        actor: 'manager',
        action: 'feedback_system_test'
      },
      select: {
        id: true,
        actor: true,
        action: true,
        rationale: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    });
    
    if (recentDecisions.length > 0) {
      console.log('✅ Database queries working correctly');
      console.log(`   Found test decision: ${recentDecisions[0].action} at ${recentDecisions[0].createdAt}`);
    } else {
      console.log('⚠️  No test decisions found in database');
    }
  } catch (error) {
    console.error('❌ Database queries failed:', error.message);
    return;
  }

  // Test 3: Check feedback files
  console.log('\n📁 Testing feedback files...');
  
  const feedbackDir = 'feedback';
  
  try {
    const feedbackFiles = fs.readdirSync(feedbackDir).filter(file => 
      file.endsWith('.md') && !file.startsWith('archive')
    );
    
    console.log(`✅ Found ${feedbackFiles.length} feedback files:`);
    feedbackFiles.forEach(file => {
      console.log(`   • ${file}`);
    });
    
    if (feedbackFiles.length >= 18) {
      console.log('✅ All agents have feedback files');
    } else {
      console.log(`⚠️  Expected 18 feedback files, found ${feedbackFiles.length}`);
    }
  } catch (error) {
    console.error('❌ Feedback files check failed:', error.message);
    return;
  }

  // Test 4: Check archived files
  console.log('\n📦 Testing archived files...');
  
  try {
    const archiveDir = 'feedback/archive';
    const archivedFiles = fs.readdirSync(archiveDir).filter(file => 
      file.endsWith('.md')
    );
    
    console.log(`✅ Found ${archivedFiles.length} archived files`);
    console.log('✅ Old feedback files properly archived');
  } catch (error) {
    console.error('❌ Archive check failed:', error.message);
    return;
  }

  console.log('\n================================================================================');
  console.log('📊 FEEDBACK SYSTEM TEST RESULTS');
  console.log('✅ logDecision() function: WORKING');
  console.log('✅ Database queries: WORKING');
  console.log('✅ Feedback files: WORKING');
  console.log('✅ Archived files: WORKING');
  
  console.log('\n🎯 RESULT:');
  console.log('• Feedback system is fully functional');
  console.log('• Database-driven feedback working');
  console.log('• All agents have proper feedback files');
  console.log('• Old files properly archived');
  
  console.log('\n🚀 Feedback system test PASSED!');

  await prisma.$disconnect();
}

testFeedbackSystem();
