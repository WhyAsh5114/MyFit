import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { MealsFormSchema } from '../schema';
import { mealKeys } from '../keys';

export const useSaveMeals = () =>
	createMutation(() => ({
		mutationFn: async ({ meals, userId }: { meals: MealsFormSchema['meals']; userId: string }) => {
			const { orm } = await getDb();
			const existingMeals = await orm.meal.where({ userId }).all();
			const submittedNames = new Set(meals.map((meal) => meal.name));

			const removedMeals = existingMeals.filter((meal) => !submittedNames.has(meal.name));

			await Promise.all([
				...removedMeals.map((meal) => orm.meal.where({ id: meal.id }).update({ active: false })),
				...meals.map((meal, index) =>
					orm.meal.upsert({
						where: { userId, name: meal.name },
						update: { name: meal.name, sortOrder: index, active: true },
						create: { id: meal.id, name: meal.name, userId, sortOrder: index, active: true }
					})
				)
			]);
			return { userId };
		},
		onSuccess: ({ userId }) => {
			queryClient.invalidateQueries({ queryKey: mealKeys.byUser(userId) });
		},
		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to save meals:', error);
		}
	}));
