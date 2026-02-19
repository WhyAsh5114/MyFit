import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { userKeys } from '$lib/features/user/user.keys';

export const useGetFoodDiaryMealsQuery = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: userKeys.current(),
			queryFn: async () => {
				const user = await getClient().user.findFirstOrThrow({
					select: { foodDiaryMeals: true },
					where: { id: userId }
				});
				return user.foodDiaryMeals;
			},
			enabled: !!userId
		};
	});
