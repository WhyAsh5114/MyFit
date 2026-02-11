import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import type { FoodEntry } from '@myfit/api/prisma/client';
import { queryClient } from '$lib/query-client';
import { foodDiaryKeys } from '$lib/query-keys/food-diary';

export const useCreateFoodEntryMutation = () =>
	createMutation(() => ({
		mutationFn: async (data: Omit<FoodEntry, 'id'>) => {
			const client = getClient();
			return await client.foodEntry.create({ data });
		},

		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: foodDiaryKeys.getByDateQuery(data.eatenAt.toISOString().split('T')[0])
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create food entry:', error);
		}
	}));
