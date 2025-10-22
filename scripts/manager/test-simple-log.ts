import prisma from '../../app/db.server';

async function testSimpleLog() {
  console.log('🔧 Testing simple Prisma insert...\n');
  
  const result = await prisma.decisionLog.create({
    data: {
      scope: 'build',
      actor: 'manager',
      action: 'test_simple',
      rationale: 'Testing simple Prisma create directly',
      evidenceUrl: 'feedback/manager/2025-10-21.md'
    }
  });
  
  console.log('✅ Insert successful! ID:', result.id);
  console.log('   Created at:', result.createdAt);
  
  return result;
}

testSimpleLog()
  .then((r) => {
    console.log('\n✅ DONE - Result:', r.id);
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  });
