import { App } from '@capacitor/app';
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { mode } from 'mode-watcher';
import { initOta } from './ota.js';

/**
 * Starts what the native apps need from the first moment: the back button, the system bar icons
 * and the OTA check. It runs from `init`, because the root layout only mounts once the first
 * navigation has loaded, and that can wait behind an account dialog. A bundle that never reaches
 * `notifyAppReady` in time is rolled back.
 */
export function startNative() {
	if (Capacitor.getPlatform() === 'android') {
		App.addListener('backButton', ({ canGoBack }) => {
			if (canGoBack) window.history.back();
			else App.exitApp();
		});
	}

	// The in-app theme can differ from the device's, so set the system bar icons to match it.
	if (Capacitor.isNativePlatform()) {
		$effect.root(() => {
			$effect(() => {
				if (!mode.current) return;
				SystemBars.setStyle({
					style: mode.current === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light
				});
			});
		});
	}

	void initOta();
}
