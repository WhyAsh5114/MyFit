import { createMutation } from '@tanstack/svelte-query';
import { checkForUpdates } from '$lib/services/ota';

export const useCheckForUpdates = () =>
	createMutation(() => ({
		mutationFn: async () => {
			await checkForUpdates();
		}
	}));
