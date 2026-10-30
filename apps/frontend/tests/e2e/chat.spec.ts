import { expect, test } from '@playwright/test';
import { API, signUp } from './support/auth';

const WEB = 'http://localhost:4173';
const CORS = {
	'access-control-allow-origin': WEB,
	'access-control-allow-credentials': 'true',
	'access-control-allow-headers': 'content-type',
	'access-control-allow-methods': 'POST, OPTIONS'
};

/** A response in the AI SDK's UI message stream format, which the chat client reads. */
const stream = (...chunks: object[]) => ({
	status: 200,
	headers: {
		...CORS,
		'content-type': 'text/event-stream',
		'x-vercel-ai-ui-message-stream': 'v1'
	},
	body: [...chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`), 'data: [DONE]\n\n'].join(
		''
	)
});

test('the chat shows a streamed question and sends the chosen answer back', async ({ page }) => {
	const bodies: { messages: { role: string; parts: { type: string; output?: string }[] }[] }[] = [];
	await page.route(`${API}/api/chat`, async (route) => {
		const request = route.request();
		if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
		bodies.push(request.postDataJSON());
		await route.fulfill(
			bodies.length === 1
				? stream(
						{ type: 'start' },
						{ type: 'start-step' },
						{
							type: 'tool-input-available',
							toolCallId: 'call_1',
							toolName: 'requireClarification',
							input: { message: 'Which size?', choices: ['Small', 'Large'] }
						},
						{ type: 'finish-step' },
						{ type: 'finish' }
					)
				: stream(
						{ type: 'start' },
						{ type: 'start-step' },
						{ type: 'text-start', id: 't1' },
						{ type: 'text-delta', id: 't1', delta: 'Logged a large sandwich.' },
						{ type: 'text-end', id: 't1' },
						{ type: 'finish-step' },
						{ type: 'finish' }
					)
		);
	});

	await signUp(page);
	await page.goto('/chat');
	await page.getByPlaceholder('Ask, Search or Chat...').fill('I ate a sandwich');
	await page.getByRole('button', { name: 'Send' }).click();

	await expect(page.getByText('Which size?')).toBeVisible();
	await page.getByRole('button', { name: 'Large' }).click();

	await expect(page.getByText('Logged a large sandwich.')).toBeVisible();
	expect(bodies).toHaveLength(2);
	const answered = bodies[1].messages.flatMap((message) => message.parts);
	expect(
		answered.some((part) => part.type === 'tool-requireClarification' && part.output === 'Large')
	).toBe(true);
});
