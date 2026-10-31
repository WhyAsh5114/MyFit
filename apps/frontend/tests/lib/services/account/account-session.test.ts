import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/navigation', () => ({ invalidate: vi.fn(async () => {}) }));

const { accountReady, onAccountChange, publishOwner } =
	await import('../../../../src/lib/services/account/account-session.svelte');

describe('onAccountChange', () => {
	beforeEach(() => publishOwner(undefined));

	it('runs when a different account replaces the one a load was handed', async () => {
		const listener = vi.fn();
		const stop = onAccountChange(listener);

		publishOwner('a');
		await accountReady(() => {});
		listener.mockClear();
		publishOwner('a');
		expect(listener).not.toHaveBeenCalled();

		publishOwner('b');
		expect(listener).toHaveBeenCalledTimes(1);
		stop();
	});

	it('runs when the account signs out', async () => {
		const listener = vi.fn();
		const stop = onAccountChange(listener);

		publishOwner('c');
		await accountReady(() => {});
		listener.mockClear();
		publishOwner(null);

		expect(listener).toHaveBeenCalledTimes(1);
		stop();
	});

	it('stops running once removed', async () => {
		const listener = vi.fn();
		onAccountChange(listener)();

		publishOwner('d');
		await accountReady(() => {});
		publishOwner('e');

		expect(listener).not.toHaveBeenCalled();
	});
});
