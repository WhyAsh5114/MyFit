/// <reference types="node" />

import type { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config';

/**
 * URL of a running Vite dev server for the native shell to load (live reload).
 * Unset for release builds, which bundle `build/`. Use `http://localhost:5173`; on the Android
 * emulator run `adb reverse tcp:5173 tcp:5173` first, because `http://10.0.2.2` is not a secure context.
 */
const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL;

const server: CapacitorConfig['server'] = devServerUrl
	? { cleartext: true, androidScheme: 'http', iosScheme: 'http', url: devServerUrl }
	: undefined;

const config: CapacitorConfig = {
	appId: 'fit.myfit',
	appName: 'MyFit',
	webDir: 'build',
	plugins: {
		CapacitorUpdater: {
			autoUpdate: false
		}
	},
	server
};

export default config;
