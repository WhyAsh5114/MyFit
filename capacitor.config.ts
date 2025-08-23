import type { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config';

const config: CapacitorConfig = {
	appId: 'fit.myfit.app',
	appName: 'MyFit',
	webDir: '.vercel/output/static',
	plugins: { StatusBar: { overlaysWebView: false } },
	server: { url: process.env.PUBLIC_BETTER_AUTH_URL, cleartext: process.env.ANDROID_DEV === 'true' }
};

export default config;
