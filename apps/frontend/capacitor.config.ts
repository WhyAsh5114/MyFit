/// <reference types="node" />

import type { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config';

const isDev = process.env.PUBLIC_API_URL?.startsWith('http://') ?? false;

let server;
if (isDev) {
	server = {
		cleartext: true,
		androidScheme: 'http',
		iosScheme: 'http'
	};
}

const config: CapacitorConfig = {
	appId: 'fit.myfit',
	appName: 'MyFit',
	webDir: 'build',
	plugins: {
		StatusBar: { overlaysWebView: false }
	},
	server
};

export default config;
