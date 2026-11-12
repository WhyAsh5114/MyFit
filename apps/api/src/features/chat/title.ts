import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { generateText } from 'ai';
import z from 'zod';
import { authMiddleware } from '../../shared/middleware/auth.js';
import { model } from './provider';

const TITLE_LENGTH = 60;
const TIMEOUT_MS = 10_000;

const instructions = `Write a short title for a conversation with a nutrition tracking assistant, from the user's first message.
- At most 6 words, in the language of the message.
- Name the food or the question, for example "Poha and chai breakfast" or "Protein left for today".
- Plain text only: no quotes, no trailing punctuation, no emoji.
- Reply with the title and nothing else.`;

/**
 * A title for a new chat, from its first message. `null` when the model fails; the app keeps the
 * start of the message as the title then.
 */
async function generateChatTitle(message: string): Promise<string | null> {
	try {
		const { text } = await generateText({
			model,
			instructions,
			messages: [{ role: 'user', content: message }],
			abortSignal: AbortSignal.timeout(TIMEOUT_MS)
		});
		const title = text
			.trim()
			.split('\n')[0]
			.replace(/^["'“”‘’]+|["'“”‘’.!?]+$/g, '')
			.trim();
		if (!title) return null;
		return title.length > TITLE_LENGTH ? `${title.slice(0, TITLE_LENGTH - 1).trimEnd()}…` : title;
	} catch (error) {
		console.warn('Could not generate a chat title', error);
		return null;
	}
}

export const chatTitleRoutes = new Hono()
	/** Names a new chat. The app asks once, beside the first message, and saves what comes back. */
	.post(
		'/',
		authMiddleware,
		zValidator('json', z.object({ text: z.string().trim().min(1).max(2000) })),
		async (c) => c.json({ title: await generateChatTitle(c.req.valid('json').text) })
	);
