import { createInfiniteQuery } from '@tanstack/svelte-query';
import { apiClient } from '$lib/clients/api-client';
import { toast } from 'svelte-sonner';
import { nutritionDataKeys } from './nutrition-data.keys';
import { NUTRITION_DATA_SEARCH_PAGINATION_LIMIT } from '@myfit/api/constants';

export const useInfiniteSearchFoodsQuery = (getSearch: () => string) =>
	createInfiniteQuery(() => {
		const search = getSearch();
		return {
			queryKey: nutritionDataKeys.searchQuery(search),
			queryFn: async ({ pageParam }) => {
				const res = await apiClient.api['nutrition-data'].$get({
					query: { search, offset: pageParam.toString() }
				});
				if (!res.ok) {
					toast.error('Failed to search foods');
					console.error('Failed to search foods', res);
				}

				const data = await res.json();
				return data.results;
			},
			initialPageParam: 0,
			getNextPageParam: (data, allPages) => {
				const limit = NUTRITION_DATA_SEARCH_PAGINATION_LIMIT;
				if (data.length < limit) return null;
				return allPages.length * limit;
			},
			enabled: search.trim().length > 0,
			staleTime: 1000 * 60 * 10,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false
		};
	});
