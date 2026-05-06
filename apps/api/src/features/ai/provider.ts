import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import 'dotenv/config';

const provider = createOpenAICompatible({
	name: 'digitalocean',
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: 'https://inference.do-ai.run/v1',
	includeUsage: true
});

export const model = provider.chatModel('openai-gpt-oss-120b');
