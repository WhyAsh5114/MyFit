import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { mealKeys } from '../keys';

export const useMeals = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: mealKeys.byUser(userId),
			queryFn: async () => {
				return await getClient().meal.findMany({
					where: { userId, active: true },
					orderBy: { sortOrder: 'asc' }
				});
			},
			enabled: !!userId
		};
	});
