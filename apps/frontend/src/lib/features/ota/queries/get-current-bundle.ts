import { createQuery } from '@tanstack/svelte-query';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { otaKeys } from '../keys';

export const useCurrentBundle = () =>
	createQuery(() => ({
		queryKey: otaKeys.currentBundle(),
		queryFn: async () => {
			const current = await CapacitorUpdater.current();
			return current.bundle;
		},
		enabled: Capacitor.getPlatform() !== 'web'
	}));
