import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
import { foodEntryFormSchemaToFoodEntry } from '$lib/features/food-diary/food-entry/food-entry.mapper';
import { foodEntryKeys } from './food-entry.keys';

export const useCreateFoodEntryMutation = () =>
	createMutation(() => ({
		mutationFn: async ({ data, userId }: { data: FoodEntryFormSchema; userId: string }) => {
			const client = getClient();
			const foodEntry = foodEntryFormSchemaToFoodEntry(data, userId);
			return await client.foodEntry.create({ data: foodEntry });
		},

		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: foodEntryKeys.getByDateQuery(data.eatenAt.toISOString().split('T')[0])
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create food entry:', error);
		}
	}));
