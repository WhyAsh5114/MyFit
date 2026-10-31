import { useMutation } from '#lib/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import type { MealsFormSchema } from '../schema';
import { mealKeys } from '../keys';
import { saveMeals } from '../save-meals';

/** Saves the complete meal configuration atomically before reloading the pages. */
export const useSaveMeals = () =>
	useMutation({
		mutationFn: async ({ meals, userId }: { meals: MealsFormSchema['meals']; userId: string }) => {
			const db = await getDb();
			await db.transaction(['meal'], (tx) => saveMeals(tx, userId, meals));
			return { userId };
		},
		onSuccess: ({ userId }) => invalidateKeys(mealKeys.byUser(userId)),
		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to save meals:', error);
		}
	});
