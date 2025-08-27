<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { healthState } from '$routes/(app)/_components/health-state.svelte';
	import { DownloadIcon, LoaderCircleIcon } from '@lucide/svelte';

	let isAvailable = $state<boolean>();
	let hasPermissions = $state<boolean>();
	let currentPlatform = $state<string>();

	$effect(() => {
		const userAgent = navigator.userAgent;
		if (/iPad|iPhone|iPod/.test(userAgent)) currentPlatform = 'iOS';
		if (/android/i.test(userAgent)) currentPlatform = 'Android';

		healthState.getPermissions(['READ_STEPS']).then((permissions) => {
			if (permissions === null) {
				isAvailable = false;
				return;
			}
			hasPermissions = permissions['READ_STEPS'];
		});
	});
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
				{#if currentPlatform === 'iOS'}
					<Button variant="outline" href="/native/myfit-ios.ipa" download="myfit-ios.ipa">
						Download for iOS <DownloadIcon />
					</Button>
				{:else if currentPlatform === 'Android'}
					<Button variant="outline" href="/native/myfit-android.apk" download="myfit-android.apk">
						Download for Android <DownloadIcon />
					</Button>
				{/if}
			</div>
		{:else if hasPermissions}
			<Button>Data is being synced</Button>
		{/if}
	</Card.Content>
</Card.Root>
