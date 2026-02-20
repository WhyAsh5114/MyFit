import { createQuery } from '@tanstack/svelte-query';
import { apiClient } from '$lib/clients/api-client';
import { toast } from 'svelte-sonner';
import { nutritionDataKeys } from '../keys';

export const useNutritionDataById = (getId: () => string) =>
	createQuery(() => {
		const id = getId();
		return {
			queryKey: nutritionDataKeys.byId(id),
			queryFn: async () => {
				const res = await apiClient.api['nutrition-data'][':id'].$get({ param: { id } });
				if (!res.ok) {
					toast.error('Failed to fetch nutrition data');
					console.error('Failed to fetch nutrition data', res);
					return null;
				}

				const data = await res.json();
				return data;
			},
			staleTime: 1000 * 60 * 10,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			enabled: id.trim().length > 0
		};
	});
