import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';

// Sign-in is not under test.
vi.mock('../../../src/shared/middleware/auth.js', () => ({
	authMiddleware: (_c: unknown, next: () => Promise<void>) => next(),
	getUserId: () => 'user-1'
}));

type ChatRequest = { messages: { role: string; content: unknown }[]; tools?: unknown[] };

const requests: ChatRequest[] = [];
const titleRequests: ChatRequest[] = [];
let provider: Server;

/** One streamed chat completion, in the OpenAI wire format the provider package reads. */
function completion(delta: object, finishReason: string) {
	const chunk = (choice: object) =>
		`data: ${JSON.stringify({ id: 'c1', object: 'chat.completion.chunk', created: 1, model: 'm', choices: [choice] })}\n\n`;
	return (
		chunk({ index: 0, delta: { role: 'assistant', ...delta }, finish_reason: null }) +
		chunk({ index: 0, delta: {}, finish_reason: finishReason }) +
		'data: [DONE]\n\n'
	);
}

beforeAll(async () => {
	provider = createServer((req, res) => {
		let body = '';
		req.on('data', (part) => (body += part));
		req.on('end', () => {
			const request = JSON.parse(body) as ChatRequest;
			// A title request is the only one made without tools, and it doesn't stream.
			if (!request.tools) {
				titleRequests.push(request);
				res.writeHead(200, { 'content-type': 'application/json' });
				return res.end(
					JSON.stringify({
						id: 'c2',
						object: 'chat.completion',
						created: 1,
						model: 'm',
						choices: [
							{
								index: 0,
								message: { role: 'assistant', content: '"Sandwich lunch."' },
								finish_reason: 'stop'
							}
						]
					})
				);
			}
			res.writeHead(200, { 'content-type': 'text/event-stream' });
			requests.push(request);
			const toolResultSent = request.messages.some((m) => m.role === 'tool');
			res.end(
				toolResultSent
					? completion({ content: 'Thanks, logging it.' }, 'stop')
					: completion(
							{
								tool_calls: [
									{
										index: 0,
										id: 'call_1',
										type: 'function',
										function: {
											name: 'requireClarification',
											arguments: JSON.stringify({ message: 'Which size?', choices: ['S', 'L'] })
										}
									}
								]
							},
							'tool_calls'
						)
			);
		});
	});
	await new Promise<void>((resolve) => provider.listen(0, resolve));
	process.env.OPENAI_API_KEY = 'test';
	process.env.OPENAI_BASE_URL = `http://localhost:${(provider.address() as AddressInfo).port}/v1`;
	process.env.OPENAI_MODEL_ID = 'test-model';
});

afterAll(() => new Promise((resolve) => provider.close(resolve)));

test('the chat route streams a tool call, then continues with the answer', async () => {
	const { chatRoutes } = await import('../../../src/features/chat/routes.ts');
	const { systemPrompt } = await import('../../../src/features/chat/system-prompt.ts');
	const { tools } = await import('../../../src/features/chat/tools.ts');

	const ask = (messages: unknown[]) =>
		chatRoutes.request('/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ messages, today: '2026-10-31' })
		});
	const user = {
		id: 'u1',
		role: 'user',
		parts: [{ type: 'text', text: 'I ate a sandwich' }]
	};

	const first = await ask([user]);
	expect(first.status).toBe(200);
	expect(first.headers.get('x-vercel-ai-ui-message-stream')).toBe('v1');
	const firstStream = await first.text();
	expect(firstStream).toContain('"type":"tool-input-available"');
	expect(firstStream).toContain('"toolName":"requireClarification"');

	// The system prompt, followed by the user's date from the app, reaches the provider as the first
	// message, and every tool is declared except web search, which needs an Exa key.
	expect(requests[0].messages[0]).toEqual({
		role: 'system',
		content: `${systemPrompt}\n\nThe user's current date is 2026-10-31.`
	});
	expect(requests[0].tools).toHaveLength(Object.keys(tools).length - 1);

	// The client sends the answered tool call back, which has to convert to a tool message.
	const answered = {
		id: 'a1',
		role: 'assistant',
		parts: [
			{
				type: 'tool-requireClarification',
				toolCallId: 'call_1',
				state: 'output-available',
				input: { message: 'Which size?', choices: ['S', 'L'] },
				output: 'L'
			}
		]
	};
	const second = await ask([user, answered]);
	expect(second.status).toBe(200);
	expect(await second.text()).toContain('Thanks, logging it.');
	expect(requests[1].messages.map((m) => m.role)).toEqual(['system', 'user', 'assistant', 'tool']);
});

test('a typed message answers a pending food entry and question instead of leaving them open', async () => {
	const { chatRoutes } = await import('../../../src/features/chat/routes.ts');
	const before = requests.length;
	const res = await chatRoutes.request('/', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [
				{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'I ate a sandwich' }] },
				{
					id: 'a1',
					role: 'assistant',
					parts: [
						{
							type: 'tool-createFoodEntry',
							toolCallId: 'call_a',
							state: 'input-available',
							input: { name: 'Sandwich', quantityG: 200 }
						},
						{
							type: 'tool-requireClarification',
							toolCallId: 'call_b',
							state: 'input-available',
							input: { message: 'Which bread?', choices: ['White', 'Rye'] }
						}
					]
				},
				{ id: 'u2', role: 'user', parts: [{ type: 'text', text: 'actually it was a salad' }] }
			]
		})
	});
	expect(res.status).toBe(200);
	await res.text();

	// Both tool calls reach the provider with a result, so it does not reject the conversation.
	const sent = requests[before].messages;
	expect(sent.filter((m) => m.role === 'tool')).toHaveLength(2);
	expect(sent.at(-1)).toMatchObject({ role: 'user' });
});

test("the user's local time and meals reach the model, and a bad value is ignored", async () => {
	const { chatRoutes } = await import('../../../src/features/chat/routes.ts');
	const { systemPrompt } = await import('../../../src/features/chat/system-prompt.ts');
	const before = requests.length;
	const res = await chatRoutes.request('/', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'I had poha' }] }],
			today: '2026-10-31',
			time: '08:15',
			meals: ['Breakfast', 'Lunch', 'Dinner'],
			unexpected: 'ignored'
		})
	});
	expect(res.status).toBe(200);
	await res.text();
	expect(requests[before].messages[0]).toEqual({
		role: 'system',
		content: [
			systemPrompt,
			'',
			"The user's current date is 2026-10-31.",
			"The user's local time is 08:15.",
			"The user's meals, in order: Breakfast, Lunch, Dinner."
		].join('\n')
	});

	const bad = await chatRoutes.request('/', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
			time: 'noon'
		})
	});
	expect(bad.status).toBe(200);
	await bad.text();
});

test('the title route names a chat from its first message, cleaned of quotes and a full stop', async () => {
	const { chatTitleRoutes } = await import('../../../src/features/chat/title.ts');
	const ask = (body: unknown) =>
		chatTitleRoutes.request('/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		});

	const res = await ask({ text: 'I ate a sandwich' });
	expect(res.status).toBe(200);
	expect(await res.json()).toEqual({ title: 'Sandwich lunch' });
	expect(titleRequests.at(-1)!.messages.at(-1)).toMatchObject({
		role: 'user',
		content: 'I ate a sandwich'
	});

	const before = titleRequests.length;
	expect((await ask({ text: '   ' })).status).toBe(400);
	expect(titleRequests).toHaveLength(before);
});

test('a pending delete the user moved on from reaches the model as cancelled', async () => {
	const { resolveMessages } = await import('../../../src/features/chat/helpers.ts');
	const [message] = resolveMessages([
		{
			id: 'a1',
			role: 'assistant',
			parts: [
				{
					type: 'tool-deleteFoodEntries',
					toolCallId: 'call_d',
					state: 'input-available',
					input: { ids: ['e1'] }
				}
			]
		}
	] as never);
	expect(message.parts[0]).toMatchObject({
		state: 'output-available',
		output: { deleted: [], cancelled: true, notFound: [] }
	});
});
