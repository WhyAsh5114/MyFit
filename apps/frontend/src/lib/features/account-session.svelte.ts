import { dependOn, invalidateKeys, type Depends } from './dependencies';

/** Whether this tab owns the app: `pending` until the lock request settles. */
export type TabStatus = 'pending' | 'active' | 'blocked';

/** Gates account views while the tab lock and the logout flow settle. */
export const accountSession = $state({
	tab: 'pending' as TabStatus,
	logout: 'idle' as 'idle' | 'busy' | 'failed',
	/**
	 * The account the local database belongs to: `undefined` while it is being reconciled with the
	 * session, `null` when there is none. Route loads read it through `loadOwner`.
	 */
	ownerId: undefined as string | null | undefined
});

export const accountKeys = { owner: ['account'] as const };

/**
 * The account a `load` should read for, or `undefined`/`null` while there is none to read for. It
 * reruns when the session cacher settles on another account, which is how a cold start gets its data.
 */
export function loadOwner(depends: Depends) {
	dependOn(depends, accountKeys.owner);
	return accountSession.ownerId;
}

/** Reruns every active `load` that reads the account. */
export const invalidateOwner = () => invalidateKeys(accountKeys.owner);

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
