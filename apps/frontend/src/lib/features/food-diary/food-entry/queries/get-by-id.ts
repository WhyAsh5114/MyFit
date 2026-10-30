import { createQuery } from '@tanstack/svelte-query';
import { getDb } from '#lib/clients/idb-client.js';
import { foodEntryKeys } from '../keys';

export const useFoodEntryById = (getUserIdAndId: () => { userId: string; id: string }) =>
	createQuery(() => {
		const { userId, id } = getUserIdAndId();
		return {
			queryKey: foodEntryKeys.byId(userId, id),
			queryFn: async () => {
				const { orm } = await getDb();
				return await orm.foodEntry.where({ id, userId }).first();
			},
			enabled: !!id && !!userId
		};
	});
