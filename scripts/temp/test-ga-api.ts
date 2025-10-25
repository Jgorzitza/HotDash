import { createDirectGaClient } from '../../app/services/ga/directClient';
import { getGaConfig } from '../../app/config/ga.server';

async function testGaApi() {
  console.log('Testing Google Analytics API connection...\n');

  try {
    const config = getGaConfig();
    console.log('GA Config:', config);
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('');

    const client = createDirectGaClient(config.propertyId);
    console.log('✅ Client created successfully');

    const sessions = await client.fetchLandingPageSessions({
      start: '2025-10-17',
      end: '2025-10-24'
    });

    console.log('✅ SUCCESS! GA API is working');
    console.log(`Retrieved ${sessions.length} landing page sessions`);
    console.log('Sample data:', JSON.stringify(sessions.slice(0, 3), null, 2));
  } catch (error: any) {
    console.error('❌ ERROR! GA API failed');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
  }
}

testGaApi();

