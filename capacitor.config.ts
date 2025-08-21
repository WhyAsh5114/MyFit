import type { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config';

let serverConfig: CapacitorConfig['server'] = undefined;
if (process.env.ANDROID_DEV === 'true') {
	serverConfig = { cleartext: true, androidScheme: 'http' };
}

const config: CapacitorConfig = {
	appId: 'fit.myfit.app',
	appName: 'MyFit',
	webDir: '.vercel/output/static',
	plugins: { StatusBar: { overlaysWebView: false } },
	server: serverConfig
};

export default config;
