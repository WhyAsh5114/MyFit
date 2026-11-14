import { Capacitor } from '@capacitor/core';

/**
 * Whether this app can install OTA bundles. The updater plugin has a web stub, so this checks for a
 * native app as well as for the plugin, which an older app binary may not have.
 */
export const hasUpdater = () =>
	Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('CapacitorUpdater');
