import { readFileSync } from 'node:fs';

/**
 * The OTA channel this build belongs to: `cap` plus the major version of the Capacitor core it
 * was built with.
 *
 * A bundle ships its own copy of the Capacitor JS, which must match the native bridge in the
 * installed app. Bundles are published to a channel and an app only asks for its own, so an app
 * on Capacitor 8 never receives a bundle built for 9. Upgrading Capacitor therefore starts a new
 * channel on its own, and apps join it when they update from the store.
 *
 * Bump this by hand for another change that old apps cannot run, such as `cap8-2`.
 */
export function otaChannel() {
	const core = new URL('../node_modules/@capacitor/core/package.json', import.meta.url);
	const { version } = JSON.parse(readFileSync(core, 'utf-8'));
	return `cap${version.split('.')[0]}`;
}
