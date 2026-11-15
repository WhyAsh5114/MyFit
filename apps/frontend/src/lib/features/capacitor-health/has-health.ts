import { Capacitor } from '@capacitor/core';

/**
 * Whether this app can read Health data. The Health plugin has a web stub, so this checks for a
 * native app as well as for the plugin, which an older app binary may not have.
 */
export const hasHealth = () =>
	Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Health');
