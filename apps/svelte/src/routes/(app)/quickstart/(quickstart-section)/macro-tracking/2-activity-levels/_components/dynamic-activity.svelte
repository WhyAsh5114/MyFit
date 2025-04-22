<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { BridgeEventRequest, BridgeEventResponse } from 'bridge-types';
	import { CableIcon, DownloadIcon, LoaderCircleIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let detectedOS = $state<'iOS' | 'Android'>();
	let isAvailable = $state<boolean>();
	let isAuthorized = $state<boolean>();

	function messageHandler(event: Event) {
		if ('data' in event && typeof event.data === 'string') {
			const bridgeResponse = JSON.parse(event.data) as BridgeEventResponse;
			if (bridgeResponse.type === 'IS_AVAILABLE') {
				isAvailable = bridgeResponse.payload as boolean;
				if (isAvailable) sendMessageToNative('IS_AUTHORIZED');
			}
			if (bridgeResponse.type === 'IS_AUTHORIZED') {
				isAuthorized = bridgeResponse.payload as boolean;
			}
			if (bridgeResponse.type === 'ASK_FOR_PERMISSIONS') {
				isAuthorized = bridgeResponse.payload as boolean;
				if (isAuthorized) {
					toast.success('Permissions granted');
				} else {
					toast.error('Permissions denied');
				}
			}
		}
	}

	onMount(async () => {
		const userAgent = navigator.userAgent;
		if (/iPad|iPhone|iPod/.test(userAgent)) {
			detectedOS = 'iOS';
			window.addEventListener('message', messageHandler);
		}
		if (/android/i.test(userAgent)) {
			detectedOS = 'Android';
			document.addEventListener('message', messageHandler);
		}

		if (detectedOS && window.ReactNativeWebView) sendMessageToNative('IS_AVAILABLE');
		else isAvailable = false;
	});

	function sendMessageToNative(eventType: BridgeEventRequest) {
		if (detectedOS && window.ReactNativeWebView) {
			window.ReactNativeWebView.postMessage(eventType);
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Dynamic activity</Card.Title>
		<Card.Description>
			Let your devices calculate your active daily energy expenditure using step count
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex justify-end">
		{#if isAvailable === undefined}
			<LoaderCircleIcon class="animate-spin" />
		{:else if isAvailable === false}
			<div class="flex flex-col items-end gap-4">
				<p class="text-sm leading-tight">
					Platform syncing not available, download the native app to sync your data
				</p>
				{#if detectedOS === 'iOS'}
					<Button variant="outline" href="/native/myfit-ios.ipa" download="myfit-ios.ipa">
						Download for iOS <DownloadIcon />
					</Button>
				{:else if detectedOS === 'Android'}
					<Button variant="outline" href="/native/myfit-android.apk" download="myfit-android.apk">
						Download for Android <DownloadIcon />
					</Button>
				{/if}
			</div>
		{:else if detectedOS === 'Android'}
			<Button>Connect with HealthConnect <CableIcon /></Button>
		{:else if detectedOS === 'iOS'}
			<Button>Connect with HealthKit <CableIcon /></Button>
		{/if}
	</Card.Content>
</Card.Root>
