import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
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
				return await getClient().macroMetrics.findFirst({
					where: { userId, effectiveFrom: { lt: dayEnd } },
					orderBy: { effectiveFrom: 'desc' }
				});
			},
			enabled: !!userId && !!date
		};
	});
