import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
import { foodEntryFormSchemaToFoodEntry } from '$lib/features/food-diary/food-entry/food-entry.mapper';
import { foodEntryKeys } from './food-entry.keys';

type MutationProps = {
	data: FoodEntryFormSchema;
	userId: string;
	id: string;
};

export const useUpdateFoodEntryMutation = () =>
	createMutation(() => ({
		mutationFn: async ({ data, userId, id }: MutationProps) => {
			const client = getClient();
			const foodEntry = foodEntryFormSchemaToFoodEntry(data, userId);
			return await client.foodEntry.update({ data: foodEntry, where: { id, userId } });
		},

		onSuccess: (data) => {
			const date = data.eatenAt.toISOString().split('T')[0];

			queryClient.invalidateQueries({
				queryKey: foodEntryKeys.getByDateQuery(date)
			});

			queryClient.invalidateQueries({
				queryKey: foodEntryKeys.getByIdQuery(data.id)
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create food entry:', error);
		}
	}));
