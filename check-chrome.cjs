const http = require('http');

// Get list of pages
http.get('http://127.0.0.1:9222/json/list', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const pages = JSON.parse(data);
      console.log('=== OPEN PAGES ===');
      pages.forEach((page, i) => {
        console.log(`\n[${i}] ${page.title}`);
        console.log(`    URL: ${page.url}`);
        console.log(`    Type: ${page.type}`);
      });
      
      // Find the Shopify app page
      const shopifyPage = pages.find(p => p.url && p.url.includes('hotdash-production.fly.dev'));
      if (shopifyPage) {
        console.log('\n=== FOUND SHOPIFY APP PAGE ===');
        console.log(`Title: ${shopifyPage.title}`);
        console.log(`URL: ${shopifyPage.url}`);
        console.log(`WebSocket: ${shopifyPage.webSocketDebuggerUrl}`);
      } else {
        console.log('\n⚠️  No Shopify app page found');
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
}).on('error', (e) => {
  console.error('Error connecting to Chrome:', e.message);
});

