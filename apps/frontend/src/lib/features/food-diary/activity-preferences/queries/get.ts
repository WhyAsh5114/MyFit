import { createQuery } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { activityPreferencesKeys } from '../keys';

export const useActivityPreferences = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: activityPreferencesKeys.byUser(userId),
			queryFn: async () => {
				try {
					const { orm } = await getDb();
					return await orm.activityPreferences
						.where({ userId })
						.orderBy({ effectiveFrom: 'desc' })
						.first();
				} catch (error) {
					toast.error('Failed to fetch activity preferences');
					console.error('Error fetching activity preferences:', error);
					throw error;
				}
			},
			enabled: !!userId
		};
	});
