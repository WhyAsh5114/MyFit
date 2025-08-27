<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Capacitor } from '@capacitor/core';
	import { CircleOffIcon, DownloadIcon, LoaderCircle } from '@lucide/svelte';
	import { Health } from 'capacitor-health';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let detectedOS = $state<'iOS' | 'Android'>();
	let isAvailable = $state<boolean>();
	let isAuthorized = $state<boolean>();

	onMount(async () => {
		const userAgent = navigator.userAgent;
		if (/iPad|iPhone|iPod/.test(userAgent)) {
			detectedOS = 'iOS';
		}
		if (/android/i.test(userAgent)) {
			detectedOS = 'Android';
		}

		if (detectedOS && Capacitor.isNativePlatform()) {
			isAvailable = (await Health.isHealthAvailable()).available;
			if (!isAvailable) {
				toast.error('Health data not available', {
					description: 'Have you installed Health Connect?',
					action: () => Health.showHealthConnectInPlayStore()
				});
			}

			const { permissions } = await Health.checkHealthPermissions({
				permissions: ['READ_TOTAL_CALORIES']
			});
			// @ts-expect-error: Types aren't up-to-date
			isAuthorized = permissions['READ_TOTAL_CALORIES'];
		} else {
			isAvailable = false;
			toast.error('Platform syncing not available');
		}
	});

	async function requestPermissions() {
		const requestResult = await Health.requestHealthPermissions({
			permissions: ['READ_TOTAL_CALORIES']
		});

		// @ts-expect-error: Types aren't up-to-date
		if (requestResult['READ_TOTAL_CALORIES']) {
			toast.success('Permissions granted');
			isAuthorized = true;
		} else {
			toast.error('Permissions denied');
		}
	}

	async function getData() {
		if (!isAuthorized) return;
		try {
			const today = new Date();
			const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			const endOfDay = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate(),
				23,
				59,
				59,
				999
			);

			const { aggregatedData } = await Health.queryAggregated({
				// @ts-expect-error: Types aren't up-to-date, but total-calories is supported
				dataType: 'total-calories',
				startDate: startOfDay.toISOString(),
				endDate: endOfDay.toISOString(),
				bucket: 'day'
			});
			toast.success('Data fetched successfully', {
				description: `Total calories burned today: ${aggregatedData[0].value.toFixed(0)}`
			});
		} catch (error) {
			if (error instanceof Error) {
				toast.error('Failed to fetch health data', { description: error.message });
			}
		}
	}
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
		<Button onclick={getData}>Fetch data</Button>
	{:else}
		<Button onclick={requestPermissions}>Grant permissions</Button>
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
