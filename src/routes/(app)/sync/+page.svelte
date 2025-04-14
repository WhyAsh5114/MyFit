<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { CircleOffIcon, DownloadIcon, LoaderCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let detectedOS = $state<'iOS' | 'Android'>();
	let isAvailable = $state<boolean>();
	let isAuthorized = $state<boolean>();
	let steps = $state<{ count: number; startTime: string; endTime: string }[]>([]);

	function messageHandler(event: Event) {
		if ('data' in event && typeof event.data === 'string') {
			const eventData: { eventType: string; payload?: unknown } = JSON.parse(event.data);
			if (eventData.eventType === 'IS_AVAILABLE') {
				isAvailable = eventData.payload as boolean;
			}
			if (eventData.eventType === 'IS_AUTHORIZED') {
				isAuthorized = eventData.payload as boolean;
			}
			if (eventData.eventType === 'ASK_FOR_PERMISSIONS') {
				isAuthorized = eventData.payload as boolean;
				if (isAuthorized) {
					toast.success('Permissions granted');
				} else {
					toast.error('Permissions denied');
				}
			}
			if (eventData.eventType === 'GET_STEPS') {
				steps = eventData.payload as typeof steps;
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

		if (detectedOS && window.ReactNativeWebView) {
			window.ReactNativeWebView.postMessage('IS_AVAILABLE');
		} else {
			isAvailable = false;
			toast.error('Platform syncing not available');
		}
	});

	$effect(() => {
		if (isAvailable) {
			window.ReactNativeWebView!.postMessage('IS_AUTHORIZED');
		}
	});

	$effect(() => {
		if (isAuthorized) {
			window.ReactNativeWebView!.postMessage('GET_STEPS');
		}
	});
</script>

<H1>Sync</H1>

{#if isAvailable === undefined}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<LoaderCircle size={128} strokeWidth={1} class="animate-spin" />
		<span>Loading</span>
	</div>
{:else if isAvailable}
	{#if isAuthorized === undefined}
		<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
			<LoaderCircle size={128} strokeWidth={1} class="animate-spin" />
			<span>Loading</span>
		</div>
	{:else if isAuthorized}
		{#each steps as record (record.startTime)}
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-2">
					<span class="text-muted-foreground text-sm font-semibold">
						{new Date(record.startTime).toLocaleString()}
					</span>
					<span class="text-muted-foreground text-sm font-semibold">to</span>
					<span class="text-muted-foreground text-sm font-semibold">
						{new Date(record.endTime).toLocaleString()}
					</span>
				</div>
				<p class="text-muted-foreground text-sm">
					{record.count} steps
				</p>
			</div>
		{/each}
	{:else}
		<Button onclick={() => window.ReactNativeWebView!.postMessage('ASK_FOR_PERMISSIONS')}>
			Grant permissions
		</Button>
	{/if}
{:else}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<CircleOffIcon size={128} strokeWidth={1} />
		<span class="font-semibold">Platform syncing not available</span>
		<p class="text-center text-sm">
			You're running the web version of the app, which doesn't support platform syncing.
		</p>
		{#if detectedOS}
			<Button
				href={detectedOS === 'iOS' ? '/platform-sync/capacitor' : '/platform-sync/cordova'}
				variant="secondary"
			>
				<DownloadIcon />
				Download for {detectedOS}
			</Button>
		{:else}
			<p class="text-center text-sm">
				To use platform syncing, please download the native version of the app on a supported
				platform.
			</p>
		{/if}
	</div>
{/if}
