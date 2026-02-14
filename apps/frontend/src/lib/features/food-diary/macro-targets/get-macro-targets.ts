import { createQuery } from '@tanstack/svelte-query';
import { getClient } from '$lib/clients/idb-client';
import { toast } from 'svelte-sonner';
import { macroTargetsKeys } from './macro-targets.keys';

export const useGetMacroTargetsQuery = (getUserId: () => string) =>
	createQuery(() => {
		const userId = getUserId();
		return {
			queryKey: macroTargetsKeys.all,
			queryFn: async () => {
				const client = getClient();
				try {
					return await client.macroTargets.findFirst({
						where: { userId },
						orderBy: { createdAt: 'desc' }
					});
				} catch (error) {
					toast.error('Failed to fetch macro targets');
					console.error('Error fetching macro targets:', error);
				}
			},
			enabled: !!userId
		};
	});
