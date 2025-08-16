class AppLayoutState {
	#lastChecked = $state<Date>();
	updateServiceWorkerFunction = $state<(reloadPage?: boolean) => Promise<void>>();
	swRegistration = $state<ServiceWorkerRegistration>();
	deferredPrompt = $state<Event & { prompt: () => void }>();
	updateDialogOpen = $state(false);

	constructor() {
		if (typeof window !== 'undefined' && 'localStorage' in window) {
			const lastCheckedItem = localStorage.getItem('last-checked');
			if (lastCheckedItem) {
				this.#lastChecked = new Date(lastCheckedItem);
			}
		}
	}

	get lastChecked() {
		return this.#lastChecked;
	}

	set lastChecked(value: Date | undefined) {
		this.#lastChecked = value;
		if (!value) {
			localStorage.removeItem('last-checked');
			return;
		}
		localStorage.setItem('last-checked', value.toISOString());
	}
}

export const appLayoutState = new AppLayoutState();
