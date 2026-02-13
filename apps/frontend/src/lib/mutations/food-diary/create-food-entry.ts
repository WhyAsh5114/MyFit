import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/query-client';
import { foodDiaryKeys } from '$lib/query-keys/food-diary';
import type { FoodEntryFormSchema } from '$lib/schemas/food-entry-form-schema';
import { foodEntryFormSchemaToFoodEntry } from '$lib/domain/food-diary/mappers';

export const useCreateFoodEntryMutation = () =>
	createMutation(() => ({
		mutationFn: async ({ data, userId }: { data: FoodEntryFormSchema; userId: string }) => {
			const client = getClient();
			const foodEntry = foodEntryFormSchemaToFoodEntry(data, userId);
			return await client.foodEntry.create({ data: foodEntry });
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
