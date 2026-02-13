import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { userKeys } from '$lib/features/user/user.keys';

export const useGetCurrentUserQuery = () =>
	createQuery(() => ({
		queryKey: userKeys.current(),
		queryFn: async () => {
			const client = getClient();
			return await client.user.findFirstOrThrow();
		}
	}));
