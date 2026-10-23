import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/model/schema';
import { foodEntryFormSchemaToFoodEntry } from '$lib/features/food-diary/food-entry/model/mapper';
import { foodEntryKeys } from '../keys';

type MutationProps = {
	data: FoodEntryFormSchema;
	userId: string;
	id: string;
};

export const useUpdateFoodEntry = () =>
	createMutation(() => ({
		mutationFn: async ({ data, userId, id }: MutationProps) => {
			const { orm } = await getDb();
			const updated = await orm.foodEntry
				.where({ id, userId })
				.update(foodEntryFormSchemaToFoodEntry(data, userId));
			if (!updated) throw new Error(`Food entry ${id} not found`);
			return updated;
		},

		onSuccess: (data) => {
			queryClient.setQueryData(foodEntryKeys.byId(data.userId, data.id), data);

			queryClient.invalidateQueries({
				queryKey: foodEntryKeys.byUser(data.userId)
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to update food entry:', error);
		}
	}));
