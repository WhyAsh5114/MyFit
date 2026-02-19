import { goto } from '$app/navigation';
import { page } from '$app/state';
import { m } from '$lib/paraglide/messages';
import type { DetectedBarcode } from 'barqode';
import { resolve } from '$app/paths';
import { toast } from 'svelte-sonner';

export async function pickBestCamera(devices: MediaDeviceInfo[]) {
	const cachedBestCamera = getCachedBestCamera(devices);
	if (cachedBestCamera) return cachedBestCamera;

	const rearDevices = devices.filter((d) => /back|rear|environment/i.test(d.label));
	devices = rearDevices.length > 0 ? rearDevices : devices;

	let bestDevice = devices[0];
	let bestScore = -1;

	for (const device of devices) {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { deviceId: { exact: device.deviceId } }
			});

			const track = stream.getVideoTracks()[0];
			const caps = track.getCapabilities();

			let score = Object.keys(caps).length;
			if ('focusDistance' in caps) score += 5;
			if ('focusMode' in caps && (caps.focusMode as string[]).includes('continuous')) score += 3;

			if (score > bestScore) {
				bestScore = score;
				bestDevice = device;
			}

			stream.getTracks().forEach((t) => t.stop());
		} catch {
			// ignore
		}
	}

	localStorage.setItem('bestCameraDeviceId', bestDevice.deviceId);
	return bestDevice;
}

function getCachedBestCamera(devices: MediaDeviceInfo[]) {
	const deviceId = localStorage.getItem('bestCameraDeviceId');
	if (!deviceId) return null;

	return devices.find((d) => d.deviceId === deviceId) ?? null;
}
