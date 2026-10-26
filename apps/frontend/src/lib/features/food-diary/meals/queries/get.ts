import { createQuery } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { mealKeys } from '../keys';

export const useMeals = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: mealKeys.byUser(userId),
			queryFn: async () => {
				const { orm } = await getDb();
				return await orm.meal.where({ userId, active: true }).orderBy({ sortOrder: 'asc' }).all();
			},
			enabled: !!userId
		};
	});
