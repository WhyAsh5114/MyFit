import { createQuery } from '@tanstack/svelte-query';
import { activityEntryKeys } from '../keys';
import { getDb } from '#lib/clients/idb-client.js';
import { and } from '@prisma-idb/client-idb/orm';
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
				const { orm } = await getDb();
				return await orm.activityEntry
					.where({ userId })
					.where((a) => and(a.performedAt.gte(dayStart), a.performedAt.lt(dayEnd)))
					.all();
			},
			enabled: !!userId && !!date
		};
	});
}
