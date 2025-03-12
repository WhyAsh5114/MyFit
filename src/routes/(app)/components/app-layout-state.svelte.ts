function createAppLayoutState() {
	let lastChecked = $state<Date>();
	let skipWaitingFunction = $state<() => void>();
	let deferredPrompt = $state<Event & { prompt: () => void }>();
	let updateDialogOpen = $state(false);

	if (typeof window !== 'undefined' && 'localStorage' in window) {
		const lastCheckedItem = localStorage.getItem('lastChecked');
		if (lastCheckedItem) {
			lastChecked = new Date(lastCheckedItem);
		}
	}

	return {
		get lastChecked() {
			return lastChecked;
		},
		set lastChecked(value) {
			lastChecked = value;
			if (!value) return;
			localStorage.setItem('lastChecked', value.toISOString());
		},
		get skipWaitingFunction() {
			return skipWaitingFunction;
		},
		set skipWaitingFunction(value) {
			skipWaitingFunction = value;
		},
		get deferredPrompt() {
			return deferredPrompt;
		},
		set deferredPrompt(value) {
			deferredPrompt = value;
		},
		get updateDialogOpen() {
			return updateDialogOpen;
		},
		set updateDialogOpen(value) {
			updateDialogOpen = value;
		}
	};
}

export const appLayoutState = createAppLayoutState();
