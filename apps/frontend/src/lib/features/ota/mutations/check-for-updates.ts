import { createMutation } from '@tanstack/svelte-query';
import { checkForUpdates } from '#lib/services/ota.js';

export const useCheckForUpdates = () =>
	createMutation(() => ({
		mutationFn: async () => {
			await checkForUpdates();
		}
	}));
