<script lang="ts">
	import { Capacitor } from '@capacitor/core';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Switch from '#lib/components/ui/switch/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { m } from '#lib/paraglide/messages.js';
	import { useCurrentBundle } from '#lib/features/ota/queries/get-current-bundle.js';
	import { useCheckForUpdates } from '#lib/features/ota/mutations/check-for-updates.js';
	import { useUpdateAutoUpdate } from '#lib/features/ota/mutations/update-auto-update.js';
	import { getCurrentUser } from '#lib/features/user/current-user.svelte.js';

	const isNative = Capacitor.getPlatform() !== 'web';

	const user = $derived(getCurrentUser());
	const bundle = useCurrentBundle();
	const checkForUpdates = useCheckForUpdates();
	const updateAutoUpdate = useUpdateAutoUpdate();

	function handleAutoUpdateToggle(value: boolean) {
		if (!user) return;
		updateAutoUpdate.mutate({ userId: user.id, autoUpdate: value });
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
					<span class="font-mono text-xs text-muted-foreground">
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
					<span class="text-xs text-muted-foreground">{m['ota.card.autoUpdateDescription']()}</span>
				</div>
				<Switch.Root
					checked={user?.autoUpdate ?? true}
					disabled={updateAutoUpdate.isPending}
					onCheckedChange={handleAutoUpdateToggle}
				/>
			</div>
		</Card.Content>
	</Card.Root>
{/if}
