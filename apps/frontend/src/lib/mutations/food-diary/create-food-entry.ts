import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/query-client';
import { foodDiaryKeys } from '$lib/query-keys/food-diary';
import type { FoodEntryFormSchema } from '$lib/schemas/food-entry-form-schema';

export const useCreateFoodEntryMutation = () =>
	createMutation(() => ({
		mutationFn: async ({ data, userId }: { data: FoodEntryFormSchema; userId: string }) => {
			const client = getClient();
			return await client.foodEntry.create({ data: { ...data, userId } });
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
