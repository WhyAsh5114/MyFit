import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { macroMetricsKeys } from '../keys';
import type { CalendarDate } from '@internationalized/date';

export const useMacroMetricsByDate = (
	getUserIdAndDate: () => { userId: string; date: CalendarDate }
) =>
	createQuery(() => {
		const { userId, date } = getUserIdAndDate();
		return {
			queryKey: macroMetricsKeys.byUser(userId),
			queryFn: async () => {
				return await getClient().macroMetrics.findFirst({
					where: { userId, effectiveFrom: { gte: date.toString() } },
					orderBy: { effectiveFrom: 'desc' }
				});
			},
			enabled: !!userId && !!date
		};
	});
