import { createQuery } from '@tanstack/svelte-query';
import { activityEntryKeys } from '../keys';
import { getClient } from '$lib/clients/idb-client';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';

export function useActivityEntriesByDate(
	getUserIdAndDate: () => { userId: string; date: CalendarDate }
) {
	return createQuery(() => {
		const { userId, date } = getUserIdAndDate();
		const timezone = getLocalTimeZone();

		const dayStart = date.toDate(timezone);
		dayStart.setHours(0, 0, 0, 0);

		const dayEnd = date.add({ days: 1 }).toDate(timezone);
		dayEnd.setHours(0, 0, 0, 0);

		return {
			queryKey: activityEntryKeys.byDate(userId, date.toString()),
			queryFn: async () => {
				return await getClient().activityEntry.findMany({
					where: { userId, performedAt: { gte: dayStart, lt: dayEnd } }
				});
			},
			enabled: !!userId && !!date
		};
	});
}
