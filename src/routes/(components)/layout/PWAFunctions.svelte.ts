import { browser } from '$app/environment';
import { useRegisterSW } from 'virtual:pwa-register/svelte';

const sw = browser
	? useRegisterSW({
			onRegisteredSW(swUrl, r) {
				if (r) {
					setInterval(async () => {
						if (!navigator || r.installing) return;
						if ('connection' in navigator && !navigator.onLine) return;

						const resp = await fetch(swUrl, {
							cache: 'no-store',
							headers: {
								cache: 'no-store',
								'cache-control': 'no-cache'
							}
						});
						if (resp.status === 200) await r.update();
					}, 3600000);
				}
				console.log(`SW Registered: ${r}`);
			},
			onRegisterError(error) {
				console.log('SW registration error', error);
			}
		})
	: null;

export const needRefresh = sw?.needRefresh;
export const updateServiceWorker = sw?.updateServiceWorker;
export const offlineReady = sw?.offlineReady;
export const updateDataLossDialog = $state({ open: false });