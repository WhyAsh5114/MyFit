import { Hono } from 'hono';
import { streamText, convertToModelMessages } from 'ai';
import { model } from './provider';
import { tools } from './tools';
import { systemPrompt } from './system-prompt';
import { resolveMessages } from './helpers';

const chatRoutes = new Hono()
	/**
	 * Chat endpoint with Vercel AI SDK
	 * Accepts an array of messages and returns a stream of text responses
	 */
	.post('/', async (c) => {
		const { messages } = await c.req.json();

		const result = streamText({
			model,
			messages: await convertToModelMessages(resolveMessages(messages)),
			system: systemPrompt,
			tools
		});

		return result.toUIMessageStreamResponse();
	});

export { chatRoutes };
