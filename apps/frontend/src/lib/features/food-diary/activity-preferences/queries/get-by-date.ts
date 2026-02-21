import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { activityPreferencesKeys } from '../keys';
import type { CalendarDate } from '@internationalized/date';

export const useActivityPreferencesByDate = (
	getUserIdAndDate: () => { userId: string; date: CalendarDate }
) =>
	createQuery(() => {
		const { userId, date } = getUserIdAndDate();
		return {
			queryKey: activityPreferencesKeys.byDate(userId, date.toString()),
			queryFn: async () => {
				const client = getClient();
				try {
					return await client.activityPreferences.findFirst({
						where: { userId, effectiveFrom: { gte: date.toString() } },
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
