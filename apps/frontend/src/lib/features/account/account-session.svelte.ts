import { dependOn, invalidateKeys, type Depends } from '#lib/features/data/dependencies.js';

/** Whether this tab owns the app: `pending` until the lock request settles. */
export type TabStatus = 'pending' | 'active' | 'blocked';

/** Gates account views while the tab lock and the logout flow settle. */
export const accountSession = $state({
	tab: 'pending' as TabStatus,
	logout: 'idle' as 'idle' | 'busy' | 'failed',
	/**
	 * The account the app is showing: `undefined` while it isn't ready (the local database is being
	 * reconciled with the session, or a dialog is waiting for the user), `null` when there is none.
	 */
	ownerId: undefined as string | null | undefined
});

export const accountKeys = { owner: ['account'] as const };

/** Loads waiting for an account, and the account the last load was handed. */
const waiting: Array<(owner: string | null) => void> = [];
let handedOwner: string | null | undefined;

/**
 * The account for a `load` to read for. It settles once the account is ready and never while a
 * dialog is waiting for the user (another account's unsynced data, a failed open, a blocked tab or
 * a logout), so the navigation just waits behind the dialog. `null` means there is no account.
 */
export function accountReady(depends: Depends): Promise<string | null> {
	dependOn(depends, accountKeys.owner);
	if (accountSession.ownerId !== undefined) {
		handedOwner = accountSession.ownerId;
		return Promise.resolve(accountSession.ownerId);
	}
	return new Promise((resolve) => waiting.push(resolve));
}

/**
 * Sets the account the app is showing, `undefined` while it isn't ready. Loads waiting for it
 * continue, and loads that already ran for another account run again.
 */
export function publishOwner(owner: string | null | undefined) {
	accountSession.ownerId = owner;
	if (owner === undefined) return;
	const stale = handedOwner !== undefined && handedOwner !== owner;
	handedOwner = owner;
	for (const resolve of waiting.splice(0)) resolve(owner);
	if (stale) void invalidateOwner();
}

/** Reruns every active `load` that reads the account. */
const invalidateOwner = () => invalidateKeys(accountKeys.owner);

const LOCK_NAME = 'myfit-active-tab';
let claimed = false;

/** Never settles, so the lock stays held until the tab closes. */
const hold = () => new Promise<never>(() => {});

/**
 * Lets one tab at a time use the app, because every tab shares one login cookie and one local
 * database. A blocked tab reloads once the active tab closes, so it starts from a clean session.
 * Without Web Locks the tab is treated as active.
 */
export function claimTab() {
	if (!navigator.locks) {
		accountSession.tab = 'active';
		return;
	}
	// The layout can remount; a second claim would block this tab on its own lock.
	if (claimed) return;
	claimed = true;
	void navigator.locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
		if (lock) {
			accountSession.tab = 'active';
			return hold();
		}
		accountSession.tab = 'blocked';
		await navigator.locks.request(LOCK_NAME, () => {
			window.location.reload();
			return hold();
		});
	});
}
