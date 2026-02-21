import { createQuery } from '@tanstack/svelte-query';
import { capacitorHealthKeys } from '../keys';
import type { CalendarDate } from '@internationalized/date';
import { Health } from '@capgo/capacitor-health';

export const useGetDaySteps = (getDate: () => CalendarDate) =>
	createQuery(() => {
		const date = getDate();
		return {
			queryKey: capacitorHealthKeys.stepCount(date.toString()),
			queryFn: async () => {
				return await Health.readSamples({
					limit: 1,
					startDate: new Date(date.year, date.month - 1, date.day).toISOString(),
					endDate: new Date(date.year, date.month - 1, date.day + 1).toISOString(),
					dataType: 'steps'
				});
			},
			staleTime: 1000 * 60 * 5,
			enabled: !!date
		};
	});
