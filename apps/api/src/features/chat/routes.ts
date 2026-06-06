import { Hono } from 'hono';
import { streamText, convertToModelMessages } from 'ai';
import { model } from './provider';

const chatRoutes = new Hono()
	/**
	 * Chat endpoint with Vercel AI SDK
	 * Accepts an array of messages and returns a stream of text responses
	 */
	.post('/', async (c) => {
		const { messages } = await c.req.json();

		const result = streamText({
			model,
			messages: await convertToModelMessages(messages),
			system: 'You are a helpful assistant.'
		});

		return result.toUIMessageStreamResponse();
	});

export { chatRoutes };
