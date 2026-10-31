import { resolve } from '$app/paths';
import { m } from '#lib/paraglide/messages.js';
import { Serwist } from '@serwist/window';
import { toast } from 'svelte-sonner';

/** How often an open tab checks for a new deploy. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

/** How long to wait for a new worker to take over before reloading anyway. */
const TAKEOVER_MS = 3000;

/**
 * Where the web app's update stands. `unavailable` where there is no worker (development and the
 * native apps, which update through OTA), and `ready` once a new version is installed and waiting
 * for the user to accept it.
 */
type UpdateStatus =
	'unavailable' | 'idle' | 'checking' | 'upToDate' | 'ready' | 'applying' | 'failed';

export const appUpdate = $state({ status: 'unavailable' as UpdateStatus });

let serwist: Serwist | undefined;
let registration: ServiceWorkerRegistration | undefined;

/**
 * Registers the service worker and keeps it current.
 *
 * Browsers only look for a new worker on navigation, which an installed single-page app rarely
 * does, so this also checks hourly and when the tab becomes visible. A new worker installs and
 * then waits: the page it would replace keeps running its own build until the user accepts, from
 * the toast or from Settings, which activates the worker and reloads.
 */
export async function registerServiceWorker() {
	serwist = new Serwist(`${resolve('/')}service-worker.js`, { type: 'module' });

	// The first install also fires "controlling", which is not an update.
	let hadController = !!navigator.serviceWorker.controller;
	serwist.addEventListener('controlling', () => {
		if (appUpdate.status === 'applying') {
			location.reload();
			return;
		}
		if (!hadController) {
			hadController = true;
			return;
		}
		// Another tab accepted the update, so this one now runs under a worker for a newer build.
		toast.info(m['app.updateReady'](), {
			id: 'app-update',
			duration: Infinity,
			action: { label: m['app.reload'](), onClick: () => location.reload() }
		});
	});

	serwist.addEventListener('waiting', () => {
		// A check from Settings shows its own result, so it doesn't also toast.
		const fromSettings = appUpdate.status === 'checking';
		appUpdate.status = 'ready';
		if (fromSettings) return;
		toast.info(m['app.updateReady'](), {
			id: 'app-update',
			duration: Infinity,
			action: { label: m['app.update'](), onClick: applyAppUpdate }
		});
	});

	registration = await serwist.register();
	if (!registration) return;
	if (appUpdate.status === 'unavailable') appUpdate.status = 'idle';

	const check = () => void registration?.update().catch(() => {});
	setInterval(check, UPDATE_CHECK_MS);
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') check();
	});
}

/** Resolves once a worker that is being installed has finished installing, or failed to. */
function installed(current: ServiceWorkerRegistration) {
	const worker = current.installing;
	if (!worker) return Promise.resolve();
	return new Promise<void>((resolve) => {
		const done = () => {
			if (worker.state === 'installing') return;
			worker.removeEventListener('statechange', done);
			resolve();
		};
		worker.addEventListener('statechange', done);
		done();
	});
}

/** Looks for a new version now, and says whether there is one waiting for the user. */
export async function checkForAppUpdate() {
	const current = registration;
	if (!current || appUpdate.status === 'checking' || appUpdate.status === 'applying') return;

	const before = appUpdate.status;
	appUpdate.status = 'checking';
	try {
		await current.update();
		await installed(current);
		appUpdate.status = current.waiting ? 'ready' : 'upToDate';
	} catch (error) {
		console.error('Could not check for an app update', error);
		appUpdate.status = before === 'ready' ? 'ready' : 'failed';
	}
}

/** Activates the waiting worker and reloads under it, once the user has accepted the update. */
export function applyAppUpdate() {
	if (!serwist || !registration?.waiting) {
		location.reload();
		return;
	}
	appUpdate.status = 'applying';
	toast.dismiss('app-update');
	serwist.messageSkipWaiting();
	// The worker's takeover reloads the page; this is for a takeover that never arrives.
	setTimeout(() => location.reload(), TAKEOVER_MS);
}
