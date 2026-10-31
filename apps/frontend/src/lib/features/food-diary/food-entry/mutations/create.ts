import { useMutation } from '#lib/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
import { foodEntryFormSchemaToFoodEntry } from '#lib/features/food-diary/food-entry/model/mapper.js';
import { foodEntryKeys } from '../keys';

export const useCreateFoodEntry = () =>
	useMutation({
		mutationFn: async ({ data, userId }: { data: FoodEntryFormSchema; userId: string }) => {
			const { orm } = await getDb();
			return await orm.foodEntry.create(foodEntryFormSchemaToFoodEntry(data, userId));
		},

		// Waits for the pages to reload, so the caller returns to a diary that already has the entry.
		onSuccess: (data) => invalidateKeys(foodEntryKeys.byUser(data.userId)),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create food entry:', error);
		}
	});
