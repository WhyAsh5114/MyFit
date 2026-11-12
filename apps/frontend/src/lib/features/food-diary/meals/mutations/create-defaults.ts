import { useMutation } from '#lib/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import { mealKeys } from '../keys';
import { saveMeals } from '../save-meals';

/**
 * Gives a new account the usual meals, named in the user's language, so the diary has somewhere to
 * log food from the start. An account that already has meals keeps them.
 */
export const useCreateDefaultMeals = () =>
	useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			const db = await getDb();
			await db.transaction(['meal'], async (tx) => {
				if ((await tx.meal.where({ userId }).all()).length > 0) return;
				const names = [
					m['foodDiary.defaultMealBreakfast'](),
					m['foodDiary.defaultMealLunch'](),
					m['foodDiary.defaultMealDinner'](),
					m['foodDiary.defaultMealSnacks']()
				];
				await saveMeals(
					tx,
					userId,
					names.map((name) => ({ id: crypto.randomUUID(), name }))
				);
			});
			return { userId };
		},
		onSuccess: ({ userId }) => invalidateKeys(mealKeys.byUser(userId)),
		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create the default meals:', error);
		}
	});
