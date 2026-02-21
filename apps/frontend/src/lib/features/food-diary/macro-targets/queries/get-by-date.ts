import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { macroTargetsKeys } from '../keys';
import type { CalendarDate } from '@internationalized/date';

export const useMacroTargetsByDate = (
	getUserIdAndDate: () => { userId: string; date: CalendarDate }
) =>
	createQuery(() => {
		const { userId, date } = getUserIdAndDate();
		return {
			queryKey: macroTargetsKeys.byDate(userId, date.toString()),
			queryFn: async () => {
				return await getClient().macroTargets.findFirst({
					where: { userId, effectiveFrom: { gte: date.toString() } },
					orderBy: { effectiveFrom: 'desc' }
				});
			},
			enabled: !!userId && !!date
		};
	});
