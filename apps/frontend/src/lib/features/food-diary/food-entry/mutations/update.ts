import { useMutation } from '#lib/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
import { foodEntryFormSchemaToFoodEntry } from '#lib/features/food-diary/food-entry/model/mapper.js';
import { foodEntryKeys } from '../keys';

type MutationProps = {
	data: FoodEntryFormSchema;
	userId: string;
	id: string;
};

export const useUpdateFoodEntry = () =>
	useMutation({
		mutationFn: async ({ data, userId, id }: MutationProps) => {
			const { orm } = await getDb();
			const updated = await orm.foodEntry
				.where({ id, userId })
				.update(foodEntryFormSchemaToFoodEntry(data, userId));
			if (!updated) throw new Error(`Food entry ${id} not found`);
			return updated;
		},

		onSuccess: (data) => invalidateKeys(foodEntryKeys.byUser(data.userId)),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to update food entry:', error);
		}
	});
