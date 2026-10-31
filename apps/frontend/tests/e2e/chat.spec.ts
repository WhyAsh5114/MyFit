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
	await page.getByPlaceholder('Tell me what you ate...').fill('I ate a sandwich');
	await page.getByRole('button', { name: 'Send' }).click();

	await expect(page.getByText('Which size?')).toBeVisible();
	await page.getByRole('radio', { name: 'Large' }).click();
	// Picking a choice only selects it; Send answers.
	await page.locator('form').getByRole('button', { name: 'Send' }).click();

	await expect(page.getByText('Logged a large sandwich.')).toBeVisible();
	expect(bodies).toHaveLength(2);
	const answered = bodies[1].messages.flatMap((message) => message.parts);
	expect(
		answered.some((part) => part.type === 'tool-requireClarification' && part.output === 'Large')
	).toBe(true);
});

test('the chat reads the diary on the device and answers from it', async ({ page }) => {
	const today = new Date().toLocaleDateString('en-CA');
	const yogurt = {
		name: 'Greek yogurt',
		quantityG: 150,
		energyKcal_100g: 65,
		carbohydratesG_100g: 4,
		fatG_100g: 0.4,
		proteinsG_100g: 10
	};
	type Body = {
		today?: string;
		messages: { role: string; parts: { type: string; output?: unknown }[] }[];
	};
	const bodies: Body[] = [];

	await page.route(`${API}/api/chat`, async (route) => {
		const request = route.request();
		if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
		const body = request.postDataJSON() as Body;
		bodies.push(body);
		const json = JSON.stringify(body.messages.at(-1));
		const start = [{ type: 'start' }, { type: 'start-step' }];
		const end = [{ type: 'finish-step' }, { type: 'finish' }];
		const reply = (text: string) =>
			route.fulfill(
				stream(
					...start,
					{ type: 'text-start', id: 't' },
					{ type: 'text-delta', id: 't', delta: text },
					{ type: 'text-end', id: 't' },
					...end
				)
			);
		if (json.includes('"output":"created"')) return reply('Logged.');
		if (json.includes('tool-readFoodEntries')) {
			return route.fulfill(
				stream(
					...start,
					{ type: 'text-start', id: 't' },
					{ type: 'text-delta', id: 't', delta: 'You had a Greek yogurt.' },
					{ type: 'text-end', id: 't' },
					...end
				)
			);
		}
		const tool = json.includes('what did I eat')
			? { toolName: 'readFoodEntries', input: { from: today } }
			: { toolName: 'createFoodEntry', input: yogurt };
		return route.fulfill(
			stream(
				...start,
				{ type: 'tool-input-available', toolCallId: `call_${bodies.length}`, ...tool },
				...end
			)
		);
	});

	await signUp(page);
	await page.goto('/chat');
	const message = page.getByPlaceholder('Tell me what you ate...');
	await message.fill('I ate yogurt');
	await page.getByRole('button', { name: 'Send' }).click();
	await page.getByRole('button', { name: 'Log', exact: true }).click();
	await expect(page.getByText('Logged', { exact: true })).toBeVisible();

	await message.fill('what did I eat today?');
	await page.getByRole('button', { name: 'Send' }).click();
	await expect(page.getByText('You had a Greek yogurt.')).toBeVisible();
	await expect(page.getByText(/Read your diary/)).toBeVisible();

	// The device answered the call, and the server only ever saw the result.
	const last = bodies.at(-1)!;
	expect(last.today).toBe(today);
	const read = last.messages
		.flatMap((m) => m.parts)
		.find((part) => part.type === 'tool-readFoodEntries');
	expect(read?.output).toMatchObject({
		days: [{ date: today, entries: [{ name: 'Greek yogurt', kcal: 97.5 }], totals: { kcal: 97.5 } }]
	});
});
