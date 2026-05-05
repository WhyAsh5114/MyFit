import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { MealsFormSchema } from '../schema';
import { mealKeys } from '../keys';

export const useSaveMeals = () =>
	createMutation(() => ({
		mutationFn: async ({ meals, userId }: { meals: MealsFormSchema['meals']; userId: string }) => {
			const client = getClient();
			const existingMeals = await client.meal.findMany({ where: { userId } });
			const submittedIds = new Set(meals.map((m) => m.id));

			const removedMeals = existingMeals.filter((m) => !submittedIds.has(m.id));

			await Promise.all([
				...removedMeals.map((m) =>
					client.meal.update({ where: { id: m.id }, data: { active: false } })
				),
				...meals.map((meal, index) =>
					client.meal.upsert({
						where: { id: meal.id },
						update: { name: meal.name, sortOrder: index, active: true },
						create: { id: meal.id, name: meal.name, userId, sortOrder: index }
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
