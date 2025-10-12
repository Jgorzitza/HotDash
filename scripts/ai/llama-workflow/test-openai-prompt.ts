import { OpenAI } from '@llamaindex/openai';
import { getConfig } from './src/config.js';

const config = getConfig();

console.log('Testing OpenAI API connectivity and prompt engineering...\n');

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
});

try {
  const messages = [
    { 
      role: 'system' as const, 
      content: `You are an AI assistant helping HotDash customer support operators.

Your role:
- Suggest professional, accurate responses based on knowledge base
- Always cite sources from documentation
- Maintain a helpful, professional tone
- Flag any questions you're unsure about

Guidelines:
- Be concise but complete
- Use clear, simple language
- Double-check technical details
- Never make up information`
    },
    { 
      role: 'user' as const, 
      content: 'A customer is asking: "What sizes of PTFE hoses do you offer and which one is best for a fuel system?"'
    }
  ];
  
  const response = await openai.chat({
    messages,
  });
  
  console.log('✅ OpenAI API Connection: SUCCESS\n');
  console.log('Response:\n');
  console.log(response.message.content);
  console.log('\n✅ Prompt engineering test complete!');
  
} catch (error: any) {
  console.error('❌ OpenAI API Connection: FAILED');
  console.error(error.message);
  process.exit(1);
}
