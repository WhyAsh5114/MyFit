import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'fit.myfit.app',
	appName: 'MyFit',
	server: { url: 'http://172.18.0.2:5173/', cleartext: true },
	plugins: {
		StatusBar: {
			style: 'dark',
			backgroundColor: '#ffffff',
			overlaysWebView: false
		}
	}
};

export default config;
