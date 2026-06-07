import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import 'dotenv/config';

const provider = createOpenAICompatible({
	name: 'digitalocean',
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL!,
	includeUsage: true
});

export const model = provider.chatModel(process.env.OPENAI_MODEL_ID!);
