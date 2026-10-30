import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';

// Sign-in is not under test.
vi.mock('../../../src/shared/middleware/auth.js', () => ({
	authMiddleware: (_c: unknown, next: () => Promise<void>) => next()
}));

type ChatRequest = { messages: { role: string; content: unknown }[]; tools?: unknown[] };

const requests: ChatRequest[] = [];
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
			requests.push(JSON.parse(body));
			const toolResultSent = requests.at(-1)!.messages.some((m) => m.role === 'tool');
			res.writeHead(200, { 'content-type': 'text/event-stream' });
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

	const ask = (messages: unknown[]) =>
		chatRoutes.request('/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ messages })
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

	// The system prompt reaches the provider as the first message, and the tools are declared.
	expect(requests[0].messages[0]).toEqual({ role: 'system', content: systemPrompt });
	expect(requests[0].tools).toHaveLength(2);

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
