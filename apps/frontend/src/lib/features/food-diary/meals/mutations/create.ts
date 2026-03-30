import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import { queryClient } from '$lib/clients/query-client';
import type { Prisma } from '@myfit/api/prisma/client';
import { mealKeys } from '../keys';

export const useCreateMeal = () =>
	createMutation(() => ({
		mutationFn: async (data: Prisma.MealUncheckedCreateInput) => {
			return await getClient().meal.create({ data });
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
