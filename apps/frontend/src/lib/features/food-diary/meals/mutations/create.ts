import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { NewRow } from '@myfit/schema/client';
import { mealKeys } from '../keys';

export const useCreateMeal = () =>
	createMutation(() => ({
		mutationFn: async (data: NewRow<'Meal'>) => {
			const db = await getDb();
			return await db.orm.meal.create(data);
		},

		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: mealKeys.byUser(data.userId)
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create meal:', error);
		}
	}));
