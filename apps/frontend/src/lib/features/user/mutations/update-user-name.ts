import { useMutation } from '#lib/features/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/features/dependencies.js';
import { userKeys } from '../keys';

/** Updates the profile name and reloads the pages that show it. */
export const useUpdateUserName = () =>
	useMutation({
		mutationFn: async ({ userId, name }: { userId: string; name: string }) => {
			const { orm } = await getDb();
			await orm.user.where({ id: userId }).update({ name: name.trim() });
		},

		onSuccess: () => invalidateKeys(userKeys.all),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to update account name:', error);
		}
	});
