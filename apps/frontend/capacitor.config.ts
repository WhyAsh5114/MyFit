import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'fit.myfit',
	appName: 'MyFit',
	webDir: 'build',
	plugins: {
		StatusBar: {
			overlaysWebView: false,
			style: 'DARK',
			backgroundColor: '#0a0a0a'
		}
	}
};

export default config;
