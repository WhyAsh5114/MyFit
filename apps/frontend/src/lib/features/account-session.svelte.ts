/** Whether this tab owns the app: `pending` until the lock request settles. */
export type TabStatus = 'pending' | 'active' | 'blocked';

/** Gates account views while the tab lock and the logout flow settle. */
export const accountSession = $state({
	tab: 'pending' as TabStatus,
	logout: 'idle' as 'idle' | 'busy' | 'failed'
});

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
