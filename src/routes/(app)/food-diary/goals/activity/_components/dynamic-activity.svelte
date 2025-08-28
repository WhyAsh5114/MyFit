<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { healthState } from '$routes/(app)/_components/health-state.svelte';
	import { DownloadIcon, HeartPlusIcon, HeartPulseIcon, LoaderCircleIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let hasPermissions = $state<null | boolean>();
	let currentPlatform = $state<string>();

	$effect(() => {
		const userAgent = navigator.userAgent;
		if (/iPad|iPhone|iPod/.test(userAgent)) currentPlatform = 'iOS';
		if (/android/i.test(userAgent)) currentPlatform = 'Android';

		healthState.getPermissions(['READ_STEPS']).then((permissions) => {
			if (permissions === null) {
				hasPermissions = null;
				return;
			}
			hasPermissions = permissions['READ_STEPS'];
		});
	});

	function showErrorToast() {
		toast.error('Platform syncing not available', {
			description: 'Download the native app on a supported platform (Android/iOS)'
		});
	}

	async function requestPermissions() {
		const grantedPermissions = (await healthState.requestPermissions(['READ_STEPS']))!;
		if (grantedPermissions['READ_STEPS']) {
			hasPermissions = true;
		} else {
			toast.error('Failed to acquire permissions', {
				description:
					'We need access to your step count data to calculate your active energy expenditure'
			});
		}
	}

	async function showSampleData() {
		const todaysSteps = (await healthState.getStepsForDay(new Date()))!;
		toast.info('Step data', {
			description: `You have taken ${todaysSteps} steps today`
		});
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
		{#if hasPermissions === undefined}
			<LoaderCircleIcon class="animate-spin" />
		{:else if hasPermissions === null}
			<div class="flex flex-col items-end gap-4">
				{#if currentPlatform === 'iOS'}
					<Button variant="outline" href="/native/myfit-ios.ipa" download="myfit-ios.ipa">
						Download for iOS <DownloadIcon />
					</Button>
				{:else if currentPlatform === 'Android'}
					<Button
						variant="outline"
						href="/native/myfit-android-debug.apk"
						download="myfit-android-debug.apk"
					>
						Download for Android <DownloadIcon />
					</Button>
				{:else}
					<Button variant="destructive" onclick={showErrorToast}>Unavailable</Button>
				{/if}
			</div>
		{:else if hasPermissions === false}
			<Button onclick={requestPermissions}>
				Grant permissions <HeartPlusIcon />
			</Button>
		{:else}
			<Button onclick={showSampleData}>Data is being synced <HeartPulseIcon /></Button>
		{/if}
	</Card.Content>
</Card.Root>
