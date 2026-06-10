import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { env } from '../../../lib/env.js';

const provider = createOpenAICompatible({
	name: 'digitalocean',
	apiKey: env.OPENAI_API_KEY,
	baseURL: env.OPENAI_BASE_URL!,
	includeUsage: true
});

export const model = provider.chatModel(env.OPENAI_MODEL_ID!);
