import { useMutation } from '#lib/features/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/features/dependencies.js';
import { localDay } from '../../_common/day-bounds';
import { foodEntryKeys } from '../keys';

/** Identifies a food entry within its owner's diary. */
type MutationProps = {
	userId: string;
	id: string;
};

/** Deletes an owned entry and reloads its diary day after the tracked write commits. */
export const useDeleteFoodEntry = () =>
	useMutation({
		// Resolves to nothing when another write removed the entry since the diary was loaded.
		mutationFn: async ({ userId, id }: MutationProps) => {
			const db = await getDb();
			const [entry] = await db.orm.foodEntry.where({ id, userId }).deleteAll();
			return entry;
		},

		// Reloads the entry's day, not its own page: that one would flash "not found" while the
		// caller navigates away.
		onSuccess: (entry, { userId }) => {
			if (!entry) {
				toast.error(m['foodDiary.foodEntryNotFound']());
				return invalidateKeys(foodEntryKeys.byUser(userId));
			}
			return invalidateKeys(foodEntryKeys.byDate(userId, localDay(entry.eatenAt)));
		},

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to delete food entry:', error);
		}
	});
