import { Hono } from 'hono';
import {
	streamText,
	convertToModelMessages,
	toUIMessageStream,
	createUIMessageStreamResponse,
	isStepCount
} from 'ai';
import z from 'zod';
import { env } from '../../../lib/env.js';
import { model } from './provider';
import { tools } from './tools';
import { systemPrompt } from './system-prompt';
import { resolveMessages, type MyUIMessage } from './helpers';
import { chatImageRoutes, resolveChatImages } from './images';
import { chatTitleRoutes } from './title';
import { authMiddleware, getUserId } from '../../shared/middleware/auth.js';

/**
 * The server answers searchFoods and webSearch itself, so one request can take a few steps. A
 * call to a tool the app answers ends the request, and the app sends the next one.
 */
const MAX_STEPS = 10;

/** What the app sends besides the messages. Each field is optional, so an older app still works. */
const context = z.object({
	// The user's local date and time, because the server's can be another day.
	today: z.iso.date().optional().catch(undefined),
	time: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional()
		.catch(undefined),
	// The user's meal names, in their order, so a food entry can name one.
	meals: z.array(z.string().max(60)).max(20).optional().catch(undefined)
});

function instructions({ today, time, meals }: z.infer<typeof context>) {
	const day = today ?? new Date().toISOString().slice(0, 10);
	const lines = [systemPrompt, '', `The user's current date is ${day}.`];
	if (time) lines.push(`The user's local time is ${time}.`);
	if (meals?.length) lines.push(`The user's meals, in order: ${meals.join(', ')}.`);
	else if (meals) lines.push('The user has no meals set up, so leave `meal` out.');
	return lines.join('\n');
}

const chatRoutes = new Hono()
	.route('/images', chatImageRoutes)
	.route('/title', chatTitleRoutes)
	/**
	 * Chat endpoint with Vercel AI SDK
	 * Accepts an array of messages and returns a stream of text responses
	 */
	.post('/', authMiddleware, async (c) => {
		const body = await c.req.json();
		const messages = body.messages as MyUIMessage[];
		const extra = context.parse(body);

		const resolved = await resolveChatImages(resolveMessages(messages), getUserId(c));
		const result = streamText({
			model,
			// A tool call cut off while streaming has no input to answer, so it is dropped.
			messages: await convertToModelMessages(resolved, { ignoreIncompleteToolCalls: true }),
			instructions: instructions(extra),
			tools,
			activeTools: env.EXA_API_KEY
				? undefined
				: (Object.keys(tools).filter((name) => name !== 'webSearch') as (keyof typeof tools)[]),
			stopWhen: isStepCount(MAX_STEPS)
		});

		return createUIMessageStreamResponse({
			stream: toUIMessageStream<typeof tools, MyUIMessage>({ stream: result.stream, tools })
		});
	});

export { chatRoutes };
