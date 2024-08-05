function createSettingsRunes() {
	let pushNotificationsEnabled = $state(false);
	let notifications = $state<{ title: string; timestamp: number }[]>([]);

	if (globalThis.localStorage) {
		const savedState = localStorage.getItem('settingsRunes');
		if (savedState) ({ notifications, pushNotificationsEnabled } = JSON.parse(savedState));
		if (Notification.permission !== 'granted') pushNotificationsEnabled = false;
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem(
			'settingsRunes',
			JSON.stringify({ settingsRunes, pushNotificationsEnabled })
		);
	}

	return {
		get notifications() {
			return notifications;
		},
		set notifications(value) {
			notifications = value;
			saveStoresToLocalStorage();
		},
		get pushNotificationsEnabled() {
			return pushNotificationsEnabled;
		},
		set pushNotificationsEnabled(value) {
			pushNotificationsEnabled = value;
			saveStoresToLocalStorage();
		},
		saveStoresToLocalStorage
	};
}

export const settingsRunes = createSettingsRunes();
