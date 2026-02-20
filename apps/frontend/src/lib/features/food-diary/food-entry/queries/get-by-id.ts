import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { foodEntryKeys } from '../keys';

export const useFoodEntryById = (getUserIdAndId: () => { userId: string; id: string }) =>
	createQuery(() => {
		const { userId, id } = getUserIdAndId();
		return {
			queryKey: foodEntryKeys.byId(userId, id),
			queryFn: async () => {
				return await getClient().foodEntry.findUnique({
					where: { id, userId }
				});
			},
			enabled: !!id && !!userId
		};
	});
