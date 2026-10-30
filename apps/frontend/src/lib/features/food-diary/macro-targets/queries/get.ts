import { createQuery } from '@tanstack/svelte-query';
import { getDb } from '#lib/clients/idb-client.js';
import { macroTargetsKeys } from '../keys';

export const useMacroTargets = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: macroTargetsKeys.byUser(userId),
			queryFn: async () => {
				const { orm } = await getDb();
				return await orm.macroTargets.where({ userId }).orderBy({ effectiveFrom: 'desc' }).first();
			},
			enabled: !!userId
		};
	});
