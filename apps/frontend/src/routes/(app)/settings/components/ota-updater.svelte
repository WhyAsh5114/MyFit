<script lang="ts">
	import { Capacitor } from '@capacitor/core';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Switch from '$lib/components/ui/switch/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { m } from '$lib/paraglide/messages';
	import { useCurrentBundle } from '$lib/features/ota/queries/get-current-bundle';
	import { useCheckForUpdates } from '$lib/features/ota/mutations/check-for-updates';
	import { useUpdateAutoUpdate } from '$lib/features/ota/mutations/update-auto-update';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';

	const isNative = Capacitor.getPlatform() !== 'web';

	const user = useCurrentUser();
	const bundle = useCurrentBundle();
	const checkForUpdates = useCheckForUpdates();
	const updateAutoUpdate = useUpdateAutoUpdate();

	function handleAutoUpdateToggle(value: boolean) {
		if (!user.data) return;
		updateAutoUpdate.mutate({ userId: user.data.id, autoUpdate: value });
	}
</script>

{#if isNative}
	<Card.Root>
		<Card.Header>
			<Card.Title>{m['ota.card.title']()}</Card.Title>
			<Card.Description>{m['ota.card.description']()}</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="flex items-center justify-between">
				<div class="flex flex-col gap-0.5">
					<span class="text-sm font-medium">{m['ota.card.currentVersion']()}</span>
					<span class="text-muted-foreground font-mono text-xs">
						{bundle.data?.version ?? '…'}
					</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					disabled={checkForUpdates.isPending}
					onclick={() => checkForUpdates.mutate()}
				>
					{checkForUpdates.isPending ? m['ota.card.checking']() : m['ota.card.checkForUpdates']()}
				</Button>
			</div>
			<div class="flex items-center justify-between">
				<div class="flex flex-col gap-0.5">
					<span class="text-sm font-medium">{m['ota.card.autoUpdate']()}</span>
					<span class="text-muted-foreground text-xs">{m['ota.card.autoUpdateDescription']()}</span>
				</div>
				<Switch.Root
					checked={user.data?.autoUpdate ?? true}
					disabled={updateAutoUpdate.isPending}
					onCheckedChange={handleAutoUpdateToggle}
				/>
			</div>
		</Card.Content>
	</Card.Root>
{/if}
