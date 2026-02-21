import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { activityPreferencesKeys } from '../keys';

export const useActivityPreferences = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: activityPreferencesKeys.byUser(userId),
			queryFn: async () => {
				const client = getClient();
				try {
					return await client.activityPreferences.findFirst({
						where: { userId },
						orderBy: { effectiveFrom: 'desc' }
					});
				} catch (error) {
					toast.error('Failed to fetch activity preferences');
					console.error('Error fetching activity preferences:', error);
					throw error;
				}
			},
			enabled: !!userId
		};
	});
