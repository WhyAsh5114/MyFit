import { createQuery } from '@tanstack/svelte-query';
import { apiClient } from '#lib/clients/api-client.js';
import { nutritionDataKeys } from '../keys';

export const useNutritionDataByCode = (getCode: () => string) =>
	createQuery(() => {
		const code = getCode();
		return {
			queryKey: nutritionDataKeys.byCode(code),
			queryFn: async () => {
				const res = await apiClient.api['nutrition-data']['code'][':code'].$get({
					param: { code }
				});
				// Throwing lets TanStack retry, and the page shows the error once the retries run out.
				if (!res.ok) throw new Error(`Failed to fetch nutrition data (${res.status})`);
				return await res.json();
			},
			staleTime: 1000 * 60 * 10,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			enabled: code.trim().length > 0
		};
	});
