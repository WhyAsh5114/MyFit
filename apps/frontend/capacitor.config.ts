/// <reference types="node" />

import type { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config';

const isDev = process.env.PUBLIC_API_URL?.startsWith('http://localhost') ?? false;

let server;
if (isDev) {
	server = {
		cleartext: true,
		url: 'http://localhost:5173'
	};
}

const config: CapacitorConfig = {
	appId: 'fit.myfit',
	appName: 'MyFit',
	webDir: 'build',
	plugins: { StatusBar: { overlaysWebView: false } },
	server
};

export default config;
