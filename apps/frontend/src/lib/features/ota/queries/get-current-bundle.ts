import { createQuery } from '@tanstack/svelte-query';
import { hasUpdater } from '#lib/features/ota/has-updater.js';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { otaKeys } from '../keys.js';

export const useCurrentBundle = () =>
	createQuery(() => ({
		queryKey: otaKeys.currentBundle(),
		queryFn: async () => {
			const current = await CapacitorUpdater.current();
			return current.bundle;
		},
		// The running bundle changes only when the app reloads into a new one.
		staleTime: Infinity,
		enabled: hasUpdater()
	}));
