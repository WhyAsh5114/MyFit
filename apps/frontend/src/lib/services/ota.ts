import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater, type BundleInfo } from '@capgo/capacitor-updater';
import { apiClient } from '$lib/clients/api-client';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';

/**
 * Self-hosted OTA: checks our API for new bundles and downloads them.
 * Auto-update (default on) downloads silently then prompts to restart.
 * When off, the user is prompted to download first, then restart.
 */

let updateCheckInProgress = false;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface BundlePayload {
	url: string;
	version: string;
	checksum: string;
}

/** Download a bundle and queue it for activation on next background/restart. */
async function downloadBundle(data: BundlePayload): Promise<BundleInfo> {
	const bundle = await CapacitorUpdater.download(data);
	await CapacitorUpdater.next({ id: bundle.id });
	return bundle;
}

/** Show an action toast inviting the user to restart now. */
function showRestartPrompt(bundleId: string): void {
	toast(m['ota.updateReady'](), {
		action: {
			label: m['ota.restart'](),
			onClick: () => CapacitorUpdater.set({ id: bundleId })
		},
		duration: 0 // persists until dismissed — next() is the safety net
	});
}

/** Show an action toast offering to download the update. */
function showDownloadPrompt(data: BundlePayload, onDownload: () => Promise<void>): void {
	toast(m['ota.updateAvailable'](), {
		action: {
			label: m['ota.download'](),
			onClick: async () => {
				toast.dismiss();
				await onDownload();
			}
		},
		duration: 0
	});
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

async function notifyAppReady(): Promise<void> {
	if (Capacitor.getPlatform() === 'web') return;
	try {
		await CapacitorUpdater.notifyAppReady();
	} catch (error) {
		console.error('OTA: Failed to notify app ready:', error);
	}
}

export async function checkForUpdates(): Promise<void> {
	if (Capacitor.getPlatform() === 'web') return;
	if (updateCheckInProgress) return;

	updateCheckInProgress = true;

	try {
		const current = await CapacitorUpdater.current();

		const res = await apiClient.api.ota.latest.$get({
			query: {
				platform: Capacitor.getPlatform() as 'ios' | 'android' | 'web',
				currentVersion: current.bundle.version
			}
		});

		if (!res.ok) return;

		const data = await res.json();
		if (data.upToDate) return;
		if (current.bundle.version === data.version) return;

		const autoUpdate = await readAutoUpdatePreference();

		if (autoUpdate) {
			const bundle = await downloadBundle(data);
			showRestartPrompt(bundle.id);
		} else {
			showDownloadPrompt(data, async () => {
				const bundle = await downloadBundle(data);
				showRestartPrompt(bundle.id);
			});
		}
	} catch (error) {
		console.error('OTA: Update check failed:', error);
	} finally {
		updateCheckInProgress = false;
	}
}

async function readAutoUpdatePreference(): Promise<boolean> {
	try {
		const user = await getClient().user.findFirst();
		return user?.autoUpdate ?? true;
	} catch {
		return true;
	}
}

export async function initOta(): Promise<void> {
	if (Capacitor.getPlatform() === 'web') return;
	await notifyAppReady();
	await checkForUpdates();
}
