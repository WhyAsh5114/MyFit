import { resolve } from '$app/paths';
import { m } from '#lib/paraglide/messages.js';
import { Serwist } from '@serwist/window';
import { toast } from 'svelte-sonner';

/** How often an open tab checks for a new deploy. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

/**
 * Registers the service worker and keeps it current.
 *
 * Browsers only look for a new worker on navigation, which an installed single-page app rarely
 * does, so this also checks hourly and when the tab becomes visible. A new worker activates by
 * itself; the page it controls keeps running, and a toast offers a reload to pick up the new
 * build instead of interrupting what the user is doing.
 */
export async function registerServiceWorker() {
	const serwist = new Serwist(`${resolve('/')}service-worker.js`, { type: 'module' });

	// The first install also fires "controlling", which is not an update.
	let hadController = !!navigator.serviceWorker.controller;
	serwist.addEventListener('controlling', () => {
		if (!hadController) {
			hadController = true;
			return;
		}
		toast.info(m['app.updateReady'](), {
			id: 'app-update',
			duration: Infinity,
			action: { label: m['app.reload'](), onClick: () => location.reload() }
		});
	});

	const registration = await serwist.register();
	const check = () => void registration?.update().catch(() => {});
	setInterval(check, UPDATE_CHECK_MS);
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') check();
	});
}
