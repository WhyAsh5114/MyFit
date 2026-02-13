import { createQuery } from '@tanstack/svelte-query';
import { type CalendarDate } from '@internationalized/date';
import { getClient } from '$lib/clients/idb-client';
import { foodEntryKeys } from './food-entry.keys';

export const useGetFoodByDateQuery = (getDate: () => CalendarDate) =>
	createQuery(() => {
		const date = getDate();
		return {
			queryKey: foodEntryKeys.getByDateQuery(date.toString()),
			queryFn: async () => {
				const dayAfter = date.add({ days: 1 }).toString();

				return await getClient().foodEntry.findMany({
					where: {
						eatenAt: {
							gte: date.toString(),
							lte: dayAfter
						}
					}
				});
			}
		};
	});
