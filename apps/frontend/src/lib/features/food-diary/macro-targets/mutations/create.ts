import { useMutation } from '#lib/features/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { invalidateKeys } from '#lib/features/dependencies.js';
import type { NewRow } from '@myfit/shared/client';
import { macroTargetsKeys } from '../keys';

export const useCreateMacroTargets = () =>
	useMutation({
		mutationFn: async (data: NewRow<'MacroTargets'>) => {
			const { orm } = await getDb();
			return await orm.macroTargets.create(data);
		},

		onSuccess: (data) => invalidateKeys(macroTargetsKeys.byUser(data.userId)),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create macro targets:', error);
		}
	});
