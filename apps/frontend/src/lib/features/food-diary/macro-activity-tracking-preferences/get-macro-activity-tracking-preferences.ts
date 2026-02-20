import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { macroActivityTrackingKeys } from './macro-activity-tracking.keys';

export const useGetMacroActivityTrackingPreferencesQuery = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: macroActivityTrackingKeys.all,
			queryFn: async () => {
				const client = getClient();
				try {
					return await client.macroActivityTrackingPreferences.findFirst({
						where: { userId }
					});
				} catch (error) {
					toast.error('Failed to fetch macro activity tracking preferences');
					console.error('Error fetching macro activity tracking preferences:', error);
				}
			},
			enabled: !!userId
		};
	});
