import { createQuery } from '@tanstack/svelte-query';
import { apiClient } from '#lib/clients/api-client.js';
import { nutritionDataKeys } from '../keys';

export const useNutritionDataById = (getId: () => string) =>
	createQuery(() => {
		const id = getId();
		return {
			queryKey: nutritionDataKeys.byId(id),
			queryFn: async () => {
				const res = await apiClient.api['nutrition-data'][':id'].$get({ param: { id } });
				// A food that doesn't exist is an answer (`null`); any other failure is an error to retry.
				if (res.status === 404) return null;
				if (!res.ok) throw new Error(`Failed to fetch nutrition data (${res.status})`);
				return await res.json();
			},
			staleTime: 1000 * 60 * 10,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			enabled: id.trim().length > 0
		};
	});
