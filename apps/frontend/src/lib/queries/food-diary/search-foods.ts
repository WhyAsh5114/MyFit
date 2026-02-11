import { createQuery } from '@tanstack/svelte-query';
import { foodDiaryKeys } from '$lib/query-keys/food-diary';
import { apiClient } from '$lib/api-client';
import { toast } from 'svelte-sonner';

export const useSearchFoodsQuery = (getSearch: () => string) =>
	createQuery(() => {
		const search = getSearch();
		return {
			queryKey: foodDiaryKeys.searchQuery(search),
			queryFn: async () => {
				const res = await apiClient.api['nutrition-data'].$get({ query: { search } });
				if (!res.ok) {
					toast.error('Failed to search foods');
					console.error('Failed to search foods', res);
				}

				const data = await res.json();
				return data.results;
			},
			enabled: search.trim().length > 0,
			staleTime: 1000 * 60 * 10,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false
		};
	});
