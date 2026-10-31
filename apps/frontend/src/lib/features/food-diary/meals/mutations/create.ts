import { useMutation } from '#lib/features/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/features/dependencies.js';
import type { NewRow } from '@myfit/shared/client';
import { mealKeys } from '../keys';

export const useCreateMeal = () =>
	useMutation({
		mutationFn: async (data: NewRow<'Meal'>) => {
			const db = await getDb();
			return await db.orm.meal.create(data);
		},

		onSuccess: (data) => invalidateKeys(mealKeys.byUser(data.userId)),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create meal:', error);
		}
	});
