import { createQuery } from '@tanstack/svelte-query';
import { getDb } from '$lib/clients/idb-client';
import { accountSession } from '$lib/features/account-session.svelte';
import { userKeys } from '../keys';

/** Reads only the user bound to the active account database. */
export const useCurrentUser = () =>
	createQuery(() => ({
		queryKey: userKeys.current(accountSession.ownerId),
		enabled: accountSession.ready && !!accountSession.ownerId,
		queryFn: async () => {
			const ownerId = accountSession.ownerId;
			if (!ownerId) throw new Error('No local account');
			const { orm } = await getDb();
			const user = await orm.user.where({ id: ownerId }).first();
			if (!user) throw new Error('No local user');
			return user;
		}
	}));
