import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { activityPreferencesKeys } from '../keys';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';

export const useActivityPreferencesByDate = (
	getUserIdAndDate: () => { userId: string; date: CalendarDate }
) =>
	createQuery(() => {
		const { userId, date } = getUserIdAndDate();
		const timezone = getLocalTimeZone();

		const dayEnd = date.add({ days: 1 }).toDate(timezone);
		dayEnd.setHours(0, 0, 0, 0);

		return {
			queryKey: activityPreferencesKeys.byDate(userId, date.toString()),
			queryFn: async () => {
				const client = getClient();
				try {
					return await client.activityPreferences.findFirst({
						where: { userId, effectiveFrom: { lt: dayEnd } },
						orderBy: { effectiveFrom: 'desc' }
					});
				} catch (error) {
					toast.error('Failed to fetch activity preferences');
					console.error('Error fetching activity preferences:', error);
					throw error;
				}
			},
			enabled: !!userId && !!date
		};
	});
