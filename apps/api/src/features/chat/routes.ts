import { Hono } from 'hono';
import {
	streamText,
	convertToModelMessages,
	toUIMessageStream,
	createUIMessageStreamResponse
} from 'ai';
import { model } from './provider';
import { tools } from './tools';
import { systemPrompt } from './system-prompt';
import { resolveMessages } from './helpers';
import { authMiddleware } from '../../shared/middleware/auth.js';

const chatRoutes = new Hono()
	/**
	 * Chat endpoint with Vercel AI SDK
	 * Accepts an array of messages and returns a stream of text responses
	 */
	.post('/', authMiddleware, async (c) => {
		const { messages, today } = await c.req.json();
		// The app sends the user's local date, because the server's can be a different day.
		const day =
			typeof today === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(today)
				? today
				: new Date().toISOString().slice(0, 10);

		const result = streamText({
			model,
			// A tool call cut off while streaming has no input to answer, so it is dropped.
			messages: await convertToModelMessages(resolveMessages(messages), {
				ignoreIncompleteToolCalls: true
			}),
			instructions: `${systemPrompt}\n\nThe user's current date is ${day}.`,
			tools
		});

		return createUIMessageStreamResponse({
			stream: toUIMessageStream({ stream: result.stream, tools })
		});
	});

export { chatRoutes };
