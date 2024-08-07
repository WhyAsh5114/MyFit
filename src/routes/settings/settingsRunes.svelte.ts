type Notification = {
	title: string;
	description?: string;
	timestamp: number;
};

function createSettingsRunes() {
	let pushNotificationsEnabled = $state(false);
	let notifications = $state<Notification[]>([]);

	let workoutDurationInterval: NodeJS.Timeout;

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

	function startWorkoutNotification() {
		if (!pushNotificationsEnabled) return;
		stopWorkoutNotification();

		const options: NotificationOptions = {
			icon: '/favicon.webp',
			body: `Duration: ${new Date(0).toISOString().slice(11, 19)}`,
			requireInteraction: true,
			tag: 'workout-notification',
			silent: true
		};

		navigator.serviceWorker.ready.then(function (registration) {
			registration.showNotification('Workout in progress', options);

			let seconds = 0;
			workoutDurationInterval = setInterval(() => {
				seconds += 1;
				registration.showNotification('Workout in progress', {
					...options,
					body: `Duration: ${new Date(seconds * 1000).toISOString().slice(11, 19)}`
				});
			}, 1000);
		});
	}

	function stopWorkoutNotification() {
		clearInterval(workoutDurationInterval);
		navigator.serviceWorker.ready.then(function (registration) {
			registration.getNotifications({ tag: 'workout-notification' }).then((notifications) => {
				notifications.forEach((notification) => {
					notification.close();
				});
			});
		});
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
		clearAllNotifications,
		startWorkoutNotification,
		stopWorkoutNotification
	};
}

export const settingsRunes = createSettingsRunes();
