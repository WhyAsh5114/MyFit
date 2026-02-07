import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'fit.myfit',
	appName: 'MyFit',
	webDir: 'build',
	plugins: { StatusBar: { overlaysWebView: false } },
	server: { cleartext: true, url: 'http://localhost:5173' }
};

export default config;
