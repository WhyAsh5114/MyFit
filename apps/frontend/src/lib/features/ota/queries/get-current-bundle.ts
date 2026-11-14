import { createQuery } from '@tanstack/svelte-query';
import { hasUpdater } from '#lib/features/ota/has-updater.js';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { otaKeys } from '../keys';

export const useCurrentBundle = () =>
	createQuery(() => ({
		queryKey: otaKeys.currentBundle(),
		queryFn: async () => {
			const current = await CapacitorUpdater.current();
			return current.bundle;
		},
		enabled: hasUpdater()
	}));
