import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'fit.myfit',
	appName: 'MyFit',
	webDir: 'build',
	plugins: {
		StatusBar: {
			overlaysWebView: false,
		}
	}
};

export default config;
