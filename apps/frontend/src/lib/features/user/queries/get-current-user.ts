import { createQuery } from '@tanstack/svelte-query';
import { getDb } from '#lib/clients/idb-client.js';
import { userKeys } from '../keys';

/** Reads only the user bound to the active account database. */
export const useCurrentUser = () =>
	createQuery(() => ({
		queryKey: userKeys.current(),
		queryFn: async () => {
			const { orm } = await getDb();
			const user = await orm.user.first();
			if (!user) throw new Error('No local user');
			return user;
		}
	}));
