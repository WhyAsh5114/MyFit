import { createQuery } from '@tanstack/svelte-query';
import { foodDiaryKeys } from '$lib/query-keys/food-diary';
import { apiClient } from '$lib/api-client';
import { toast } from 'svelte-sonner';
import type { CalendarDate } from '@internationalized/date';
import { getClient } from '$lib/idb-client';

export const useGetFoodByDateQuery = (getDate: () => CalendarDate) =>
	createQuery(() => {
		const date = getDate();
		return {
			queryKey: foodDiaryKeys.getByDateQuery(date.toString()),
			queryFn: async () => {
				const dayBefore = date.subtract({ days: 1 }).toString();
				const dayAfter = date.add({ days: 1 }).toString();

				return await getClient().foodEntry.findMany({
					where: {
						eatenAt: {
							gte: dayBefore,
							lte: dayAfter
						}
					}
				});
			}
		};
	});
