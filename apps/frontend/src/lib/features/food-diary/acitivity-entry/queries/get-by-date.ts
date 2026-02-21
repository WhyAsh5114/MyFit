import { createQuery } from '@tanstack/svelte-query';
import { activityEntryKeys } from '../keys';
import { getClient } from '$lib/clients/idb-client';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';

export function useActivityEntriesByDate(
	getUserIdAndDate: () => { userId: string; date: CalendarDate }
) {
	return createQuery(() => {
		const { userId, date } = getUserIdAndDate();

		return {
			queryKey: activityEntryKeys.byDate(userId, date.toString()),
			queryFn: async () => {
				const timezone = getLocalTimeZone();

				const dayStart = date.toDate(timezone);
				dayStart.setHours(0, 0, 0, 0);

				const dayEnd = date.toDate(timezone);
				dayEnd.setHours(23, 59, 59, 999);

				return await getClient().activityEntry.findMany({
					where: { userId, performedAt: { gte: dayStart, lt: dayEnd } }
				});
			},
			enabled: !!userId && !!date
		};
	});
}
