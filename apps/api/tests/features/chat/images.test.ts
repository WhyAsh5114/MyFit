import { describe, expect, it, vi } from 'vitest';

const objects = vi.hoisted(() => new Map<string, string>());
vi.mock('../../../lib/storage.js', () => ({
	getStorage: async () => ({
		file: (key: string) => ({
			arrayBuffer: async () => {
				if (!objects.has(key)) throw new Error('NoSuchKey');
				return new TextEncoder().encode(objects.get(key)).buffer;
			},
			stat: async () => ({ type: 'image/jpeg' })
		})
	})
}));

const { resolveChatImages } = await import('../../../src/features/chat/images.ts');

const ids = Array.from({ length: 6 }, (_, i) => `00000000-0000-4000-8000-00000000000${i}`);
const photo = (id: string) => ({ type: 'file', mediaType: 'image/jpeg', url: `chat-image:${id}` });
const message = (id: string, parts: object[]) => ({ id, role: 'user', parts }) as never;

describe('resolveChatImages', () => {
	it("sends the newest photos as data from the user's own path, and describes the rest", async () => {
		for (const id of ids) objects.set(`chat-images/u1/${id}`, id);
		objects.delete(`chat-images/u1/${ids[5]}`);

		const resolved = await resolveChatImages(
			[
				message('m1', [photo(ids[0]), photo(ids[1])]),
				message('m2', [{ type: 'text', text: 'and these' }, photo(ids[2]), photo(ids[3])]),
				message('m3', [photo(ids[4]), photo(ids[5])])
			],
			'u1'
		);
		const parts = resolved.flatMap((m) => m.parts);

		// The two oldest of six are past the limit of four.
		expect(parts[0]).toEqual({ type: 'text', text: '[An earlier photo, not shown again.]' });
		expect(parts[1]).toEqual({ type: 'text', text: '[An earlier photo, not shown again.]' });
		expect(parts[2]).toEqual({ type: 'text', text: 'and these' });
		expect(parts[3]).toMatchObject({
			type: 'file',
			url: `data:image/jpeg;base64,${Buffer.from(ids[2]).toString('base64')}`
		});
		// Missing from storage.
		expect(parts.at(-1)).toEqual({ type: 'text', text: '[A photo that is no longer available.]' });
	});

	it("never reads another user's photo", async () => {
		objects.set(`chat-images/u2/${ids[0]}`, 'secret');
		const [resolved] = await resolveChatImages([message('m1', [photo(ids[0])])], 'u3');
		expect(resolved.parts[0]).toEqual({
			type: 'text',
			text: '[A photo that is no longer available.]'
		});
	});

	it('leaves a message without stored photos as it is', async () => {
		const inline = { type: 'file', mediaType: 'image/png', url: 'data:image/png;base64,AA==' };
		const [resolved] = await resolveChatImages([message('m1', [inline])], 'u1');
		expect(resolved.parts[0]).toEqual(inline);
	});
});
