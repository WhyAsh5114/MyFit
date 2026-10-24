import { createQuery } from '@tanstack/svelte-query';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';
import { getDb } from '$lib/clients/idb-client';
import { and } from '@prisma-idb/client-idb/orm';
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
				const { orm } = await getDb();
				return await orm.foodEntry
					.where({ userId })
					.where((f) => and(f.eatenAt.gte(dayStart), f.eatenAt.lt(dayEnd)))
					.orderBy({ eatenAt: 'asc' })
					.include('meal')
					.all();
			},
			enabled: !!userId && !!date
		};
	});
