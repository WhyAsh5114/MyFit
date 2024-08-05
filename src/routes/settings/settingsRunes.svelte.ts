type Notification = {
	title: string;
	description?: string;
	timestamp: number;
};

function createSettingsRunes() {
	let pushNotificationsEnabled = $state(false);
	let notifications = $state<Notification[]>([]);

	if (globalThis.localStorage && globalThis.Notification) {
		const savedState = localStorage.getItem('settingsRunes');
		if (savedState) ({ notifications } = JSON.parse(savedState));
		pushNotificationsEnabled = Notification.permission === 'granted';
	}

	function saveStoresToLocalStorage() {
		localStorage.setItem(
			'settingsRunes',
			JSON.stringify({ notifications, pushNotificationsEnabled })
		);
	}

	function addNotification(notification: Notification) {
		notifications.push(notification);
		saveStoresToLocalStorage();

		if (pushNotificationsEnabled) {
			new Notification(notification.title, {
				body: notification.description,
				icon: '/favicon.webp'
			});
		}
	}

	function deleteNotification(idx: number) {
		notifications.splice(idx, 1);
		saveStoresToLocalStorage();
	}

	function clearAllNotifications() {
		notifications = [];
		saveStoresToLocalStorage();
	}

	return {
		get notifications() {
			return notifications;
		},
		set notifications(value) {
			notifications = value;
		},
		get pushNotificationsEnabled() {
			return pushNotificationsEnabled;
		},
		set pushNotificationsEnabled(value) {
			pushNotificationsEnabled = value;
			saveStoresToLocalStorage();
		},
		saveStoresToLocalStorage,
		addNotification,
		deleteNotification,
		clearAllNotifications
	};
}

export const settingsRunes = createSettingsRunes();
