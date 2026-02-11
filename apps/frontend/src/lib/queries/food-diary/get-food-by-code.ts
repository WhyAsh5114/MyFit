import { createQuery } from '@tanstack/svelte-query';
import { foodDiaryKeys } from '$lib/query-keys/food-diary';
import { apiClient } from '$lib/api-client';
import { toast } from 'svelte-sonner';

export const useGetFoodByCodeQuery = (getCode: () => string) =>
	createQuery(() => {
		const code = getCode();
		return {
			queryKey: foodDiaryKeys.getByCodeQuery(code),
			queryFn: async () => {
				const res = await apiClient.api['nutrition-data'][':code'].$get({ param: { code } });
				if (!res.ok) {
					toast.error('Failed to fetch food data');
					console.error('Failed to fetch food data', res);
					return null;
				}

				const data = await res.json();
				return data;
			},
			staleTime: 1000 * 60 * 10,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			enabled: code.trim().length > 0
		};
	});
