import { createQuery } from '@tanstack/svelte-query';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';
import { getClient } from '$lib/clients/idb-client';
import { foodEntryKeys } from '../keys';

export const useFoodEntriesByDate = (
	getUserIdAndDate: () => { userId: string; date: CalendarDate }
) =>
	createQuery(() => {
		const { userId, date } = getUserIdAndDate();
		return {
			queryKey: foodEntryKeys.byDate(userId, date.toString()),
			queryFn: async () => {
				const timezone = getLocalTimeZone();
				const dayAfter = date.add({ days: 1 }).toDate(timezone);

				return await getClient().foodEntry.findMany({
					where: {
						eatenAt: {
							gte: date.toDate(timezone),
							lt: dayAfter
						},
						userId
					},
					orderBy: { eatenAt: 'asc' }
				});
			},
			enabled: !!userId && !!date
		};
	});
