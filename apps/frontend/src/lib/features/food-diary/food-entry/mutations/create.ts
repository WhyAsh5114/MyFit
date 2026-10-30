import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { queryClient } from '#lib/clients/query-client.js';
import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
import { foodEntryFormSchemaToFoodEntry } from '#lib/features/food-diary/food-entry/model/mapper.js';
import { foodEntryKeys } from '../keys';

export const useCreateFoodEntry = () =>
	createMutation(() => ({
		mutationFn: async ({ data, userId }: { data: FoodEntryFormSchema; userId: string }) => {
			const { orm } = await getDb();
			return await orm.foodEntry.create(foodEntryFormSchemaToFoodEntry(data, userId));
		},

		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: foodEntryKeys.byDate(data.userId, data.eatenAt.toISOString().split('T')[0])
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create food entry:', error);
		}
	}));
