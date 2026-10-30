import { createMutation } from '@tanstack/svelte-query';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { queryClient } from '#lib/clients/query-client.js';
import { foodEntryKeys } from '../keys';

/** Identifies a food entry within its owner's diary. */
type MutationProps = {
	userId: string;
	id: string;
};

/** Deletes an owned entry and invalidates its diary day after the tracked write commits. */
export const useDeleteFoodEntry = () =>
	createMutation(() => ({
		// Resolves to nothing when another write removed the entry since the diary was loaded.
		mutationFn: async ({ userId, id }: MutationProps) => {
			const db = await getDb();
			const [entry] = await db.orm.foodEntry.where({ id, userId }).deleteAll();
			return entry;
		},

		onSuccess: (entry, { userId }) => {
			if (!entry) {
				queryClient.invalidateQueries({ queryKey: foodEntryKeys.byUser(userId) });
				toast.error(m['foodDiary.foodEntryNotFound']());
				return;
			}
			queryClient.invalidateQueries({
				queryKey: foodEntryKeys.byDate(entry.userId, entry.eatenAt.toISOString().split('T')[0])
			});
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to delete food entry:', error);
		}
	}));
