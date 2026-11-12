import { useMutation } from '#lib/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/data/dependencies.js';
import { foodEntryKeys } from '../keys';

/**
 * Deletes several of a user's entries in one write, all or none, and resolves to the ones it
 * deleted. An entry another write removed first is skipped.
 */
export const useDeleteFoodEntries = () =>
	useMutation({
		mutationFn: async ({ userId, ids }: { userId: string; ids: string[] }) => {
			const { orm } = await getDb();
			return await orm.foodEntry
				.where({ userId })
				.where((entry) => entry.id.in(ids))
				.deleteAll();
		},
		onSuccess: (_deleted, { userId }) => invalidateKeys(foodEntryKeys.byUser(userId)),
		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to delete food entries:', error);
		}
	});
