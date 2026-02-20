import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { userKeys } from '../keys';

export const useCurrentUser = () =>
	createQuery(() => ({
		queryKey: userKeys.current(),
		queryFn: async () => {
			const client = getClient();
			return await client.user.findFirstOrThrow();
		}
	}));
