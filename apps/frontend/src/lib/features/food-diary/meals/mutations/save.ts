import { useMutation } from '#lib/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import type { MealsFormSchema } from '../schema';
import { mealKeys } from '../keys';

/** Saves the complete meal configuration atomically before reloading the pages. */
export const useSaveMeals = () =>
	useMutation({
		mutationFn: async ({ meals, userId }: { meals: MealsFormSchema['meals']; userId: string }) => {
			const db = await getDb();
			await db.transaction(['meal'], async (tx) => {
				const existingMeals = await tx.meal.where({ userId }).all();
				const submittedNames = new Set(meals.map((meal) => meal.name));
				const removedMeals = existingMeals.filter((meal) => !submittedNames.has(meal.name));

				for (const meal of removedMeals) {
					await tx.meal.where({ id: meal.id }).update({ active: false });
				}
				for (const [index, meal] of meals.entries()) {
					await tx.meal.upsert({
						where: { userId, name: meal.name },
						update: { name: meal.name, sortOrder: index, active: true },
						create: { id: meal.id, name: meal.name, userId, sortOrder: index, active: true }
					});
				}
			});
			return { userId };
		},
		onSuccess: ({ userId }) => invalidateKeys(mealKeys.byUser(userId)),
		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to save meals:', error);
		}
	});
