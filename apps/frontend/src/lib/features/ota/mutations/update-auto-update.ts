import { useMutation } from '#lib/features/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { m } from '#lib/paraglide/messages.js';
import { toast } from 'svelte-sonner';
import { invalidateKeys } from '#lib/features/dependencies.js';
import { userKeys } from '#lib/features/user/keys.js';

/** Updates the OTA preference and reloads the pages that show it. */
export const useUpdateAutoUpdate = () =>
	useMutation({
		mutationFn: async ({ userId, autoUpdate }: { userId: string; autoUpdate: boolean }) => {
			const { orm } = await getDb();
			await orm.user.where({ id: userId }).update({ autoUpdate });
		},

		onSuccess: () => invalidateKeys(userKeys.all),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('OTA: Failed to save autoUpdate preference:', error);
		}
	});
