import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.myfit.app',
	appName: 'MyFit',
	webDir: '.vercel/output/static',
	plugins: {
		StatusBar: {
			overlaysWebView: false,
			style: 'DARK',
			backgroundColor: '#2f78ca'
		}
	}
};

export default config;
