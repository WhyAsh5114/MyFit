import { createQuery } from '@tanstack/svelte-query';
import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';
import { getClient } from '$lib/clients/idb-client';
import { foodEntryKeys } from './food-entry.keys';

export const useGetFoodEntryByIdQuery = (getId: () => string) =>
	createQuery(() => {
		const id = getId();
		return {
			queryKey: foodEntryKeys.getByIdQuery(id),
			queryFn: async () => {
				return await getClient().foodEntry.findUnique({
					where: { id }
				});
			},
      enabled: !!id
		};
	});
