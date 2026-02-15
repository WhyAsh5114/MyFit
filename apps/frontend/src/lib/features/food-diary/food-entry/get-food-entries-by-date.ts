import { createQuery } from '@tanstack/svelte-query';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';
import { getClient } from '$lib/clients/idb-client';
import { foodEntryKeys } from './food-entry.keys';

export const useGetFoodEntriesByDateQuery = (getDate: () => CalendarDate) =>
	createQuery(() => {
		const date = getDate();
		return {
			queryKey: foodEntryKeys.getByDateQuery(date.toString()),
			queryFn: async () => {
				const timezone = getLocalTimeZone();
				const dayAfter = date.add({ days: 1 }).toDate(timezone);

				return await getClient().foodEntry.findMany({
					where: {
						eatenAt: {
							gte: date.toDate(timezone),
							lte: dayAfter
						}
					}
				});
			}
		};
	});
