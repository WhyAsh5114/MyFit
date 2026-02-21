import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { macroTargetsKeys } from '../keys';

export const useMacroTargets = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: macroTargetsKeys.byUser(userId),
			queryFn: async () => {
				return await getClient().macroTargets.findFirst({
					where: { userId },
					orderBy: { effectiveFrom: 'desc' }
				});
			},
			enabled: !!userId
		};
	});
