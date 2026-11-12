import { useMutation } from '#lib/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import { foodEntryKeys } from '../keys';

export type FoodEntryChanges = {
	productName?: string;
	quantityG?: number;
	eatenAt?: Date;
	mealId?: string | null;
	energyKcal_100g?: number;
	carbohydratesG_100g?: number;
	fatG_100g?: number;
	proteinsG_100g?: number;
};

/**
 * Changes several of a user's entries in one write, all or none, and resolves to the ones it
 * changed. An entry another write removed first is skipped.
 */
export const useUpdateFoodEntries = () =>
	useMutation({
		mutationFn: async ({
			userId,
			changes
		}: {
			userId: string;
			changes: { id: string; data: FoodEntryChanges }[];
		}) => {
			const db = await getDb();
			return await db.transaction(['foodEntry'], async (tx) => {
				const updated = [];
				for (const { id, data } of changes) {
					const entry = await tx.foodEntry.where({ id, userId }).update(data);
					if (entry) updated.push(entry);
				}
				return updated;
			});
		},
		onSuccess: (_updated, { userId }) => invalidateKeys(foodEntryKeys.byUser(userId)),
		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to update food entries:', error);
		}
	});
