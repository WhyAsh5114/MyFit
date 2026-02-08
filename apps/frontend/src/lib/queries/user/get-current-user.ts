import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/idb-client';
import { userKeys } from '$lib/query-keys/user';

export const useCurrentUserQuery = () =>
	createQuery(() => ({
		queryKey: userKeys.current(),
		queryFn: async () => {
			const client = getClient();
			return await client.user.findFirstOrThrow();
		}
	}));
