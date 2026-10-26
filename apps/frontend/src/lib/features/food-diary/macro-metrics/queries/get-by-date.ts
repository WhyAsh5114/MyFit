import { createQuery } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { macroMetricsKeys } from '../keys';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';

export const useMacroMetricsByDate = (
	getUserIdAndDate: () => { userId: string; date: CalendarDate }
) =>
	createQuery(() => {
		const { userId, date } = getUserIdAndDate();
		const timezone = getLocalTimeZone();

		const dayEnd = date.add({ days: 1 }).toDate(timezone);
		dayEnd.setHours(0, 0, 0, 0);

		return {
			queryKey: macroMetricsKeys.byDate(userId, date.toString()),
			queryFn: async () => {
				const { orm } = await getDb();
				return await orm.macroMetrics
					.where({ userId })
					.where((row) => row.effectiveFrom.lt(dayEnd))
					.orderBy({ effectiveFrom: 'desc' })
					.first();
			},
			enabled: !!userId && !!date
		};
	});
