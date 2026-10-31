import { describe, expect, it } from 'vitest';
import { defineReader, dependencyId } from '#lib/features/data/dependencies.js';

describe('defineReader', () => {
	const keys = (id: string) => [['thing', id] as const, ['thing', id, 'detail'] as const];

	it('registers its keys before the read settles', async () => {
		const registered: string[] = [];
		let reading = false;
		const read = defineReader({
			keys: (id: string) => keys(id),
			read: async (id) => {
				reading = true;
				return `row ${id}`;
			}
		});

		const result = read((...deps) => registered.push(...deps), 'a');

		// The read promise exists already, but the dependencies were registered first, in the same
		// synchronous turn: a `load` that awaited something else before this call still tracks them.
		expect(registered).toEqual(keys('a').map(dependencyId));
		expect(reading).toBe(true);
		expect(await result).toBe('row a');
	});

	it('registers the keys for the arguments it was called with', async () => {
		const registered: string[] = [];
		const read = defineReader({ keys: (id: string) => keys(id), read: async (id) => id });

		await read((...deps) => registered.push(...deps), 'b');
		await read((...deps) => registered.push(...deps), 'c');

		expect(registered).toEqual([...keys('b'), ...keys('c')].map(dependencyId));
	});
});
