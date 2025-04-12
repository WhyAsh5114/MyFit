<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { CircleOffIcon, DownloadIcon, LoaderCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let detectedOS = $state<'iOS' | 'Android'>();
	let isAvailable = $state<boolean>();
	let isAuthorized = $state<boolean>();
	let result = $state<{ startDate: string; endDate: string; value: number }[]>([]);

	onMount(async () => {
		if ('cordova' in window) {
			window.cordova.plugins.health.isAvailable(
				(available) => (isAvailable = available),
				(error) => alert(error)
			);
		} else {
			isAvailable = false;
		}

		const userAgent = navigator.userAgent;
		if (/iPad|iPhone|iPod/.test(userAgent)) {
			detectedOS = 'iOS';
		}
		if (/android/i.test(userAgent)) {
			detectedOS = 'Android';
		}
	});

	$effect(() => {
		if (isAvailable) {
			window.cordova.plugins.health.isAuthorized(
				{ read: ['steps'], write: ['steps'] },
				(authorized) => (isAuthorized = authorized),
				(error) => alert(error)
			);
		}
	});

	$effect(() => {
		if (isAvailable && isAuthorized) {
			window.cordova.plugins.health.query(
				{
					startDate: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // three days ago
					endDate: new Date(), // now
					dataType: 'steps'
				},
				(values) => (result = values),
				(error) => alert(error)
			);
		}
	});
</script>

<H1>Platform sync</H1>

{#if isAvailable === undefined}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<LoaderCircle size={128} strokeWidth={1} class="animate-spin" />
		<span>Loading</span>
	</div>
{:else if isAvailable}
	{#if isAuthorized === undefined}
		<LoaderCircle class="animate-spin" />
	{:else if isAuthorized}
		{#each result as item (item.startDate)}
			<div>
				<p>Steps: {item.value}</p>
				<p>Start Date: {new Date(item.startDate).toLocaleString()}</p>
				<p>End Date: {new Date(item.endDate).toLocaleString()}</p>
			</div>
		{/each}
	{:else}
		<Button>Grant permissions</Button>
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
