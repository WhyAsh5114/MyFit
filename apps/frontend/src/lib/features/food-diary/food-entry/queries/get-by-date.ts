import { createQuery } from '@tanstack/svelte-query';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';
import { getClient } from '$lib/clients/idb-client';
import { foodEntryKeys } from '../keys';

export const useFoodEntriesByDate = (
	getUserIdAndDate: () => { userId: string; date: CalendarDate }
) =>
	createQuery(() => {
		const { userId, date } = getUserIdAndDate();
		const timezone = getLocalTimeZone();

		const dayStart = date.toDate(timezone);
		dayStart.setHours(0, 0, 0, 0);

		const dayEnd = date.add({ days: 1 }).toDate(timezone);
		dayEnd.setHours(0, 0, 0, 0);

		return {
			queryKey: foodEntryKeys.byDate(userId, date.toString()),
			queryFn: async () => {
				return await getClient().foodEntry.findMany({
					where: {
						eatenAt: {
							gte: dayStart,
							lt: dayEnd
						},
						userId
					},
					orderBy: { eatenAt: 'asc' }
				});
			},
			enabled: !!userId && !!date
		};
	});
