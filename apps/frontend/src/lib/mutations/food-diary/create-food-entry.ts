import { createMutation } from '@tanstack/svelte-query';
import { getClient } from '$lib/idb-client';
import { toast } from 'svelte-sonner';
import { m } from '$lib/paraglide/messages';
import type { FoodEntry } from '@myfit/api/prisma/client';

export const useCreateFoodEntryMutation = () =>
	createMutation(() => ({
		mutationFn: async (data: Omit<FoodEntry, 'id'>) => {
			const client = getClient();

			await client.foodEntry.create({ data });
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create food entry:', error);
		}
	}));
