import type { InferUITools } from 'ai';
import z from 'zod';

export const tools = {
	requireClarification: {
		description: 'Ask the user a clarifying question with multiple choice answers.',
		inputSchema: z.object({
			message: z.string().describe('The clarifying question to ask the user.'),
			choices: z
				.array(z.string())
				.describe('The multiple choice options for the user to pick from.')
		})
	}
};

export type MyUITools = InferUITools<typeof tools>;
