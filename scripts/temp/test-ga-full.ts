import { getLandingPageAnomalies } from '../../app/services/ga/ingest';

async function testGaApi() {
  console.log('Testing Google Analytics API integration (full flow)...\n');
  
  try {
    const result = await getLandingPageAnomalies({ shopDomain: 'occ' });
    
    console.log('✅ SUCCESS! GA API integration is working');
    console.log(`Retrieved ${result.data.length} landing page anomalies`);
    console.log(`Source: ${result.source}`);
    console.log(`Fact ID: ${result.fact.id}`);
    console.log('\nSample anomalies:', JSON.stringify(result.data.slice(0, 3), null, 2));
  } catch (error: any) {
    console.error('❌ ERROR! GA API integration failed');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
  }
}

testGaApi();

