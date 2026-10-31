<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import {
		appUpdate,
		applyAppUpdate,
		checkForAppUpdate
	} from '#lib/features/app-update/service-worker.svelte.js';
	import { m } from '#lib/paraglide/messages.js';

	const status = $derived(
		{
			idle: null,
			checking: null,
			upToDate: m['appUpdate.upToDate'](),
			ready: m['appUpdate.ready'](),
			applying: m['appUpdate.updating'](),
			failed: m['appUpdate.failed'](),
			unavailable: null
		}[appUpdate.status]
	);
</script>

<!-- Only where a service worker runs: the web build. The native apps update through OTA. -->
{#if appUpdate.status !== 'unavailable'}
	<Card.Root>
		<Card.Header>
			<Card.Title>{m['appUpdate.title']()}</Card.Title>
			<Card.Description>{m['appUpdate.description']()}</Card.Description>
			<Card.Action>
				{#if appUpdate.status === 'ready'}
					<Button size="sm" onclick={applyAppUpdate}>{m['appUpdate.update']()}</Button>
				{:else if appUpdate.status === 'applying'}
					<Button size="sm" disabled><Spinner />{m['appUpdate.updating']()}</Button>
				{:else}
					<Button
						variant="outline"
						size="sm"
						disabled={appUpdate.status === 'checking'}
						onclick={checkForAppUpdate}
					>
						{#if appUpdate.status === 'checking'}
							<Spinner />{m['appUpdate.checking']()}
						{:else}
							{m['appUpdate.check']()}
						{/if}
					</Button>
				{/if}
			</Card.Action>
		</Card.Header>
		{#if status}
			<Card.Content>
				<p role="status" class="text-sm">{status}</p>
			</Card.Content>
		{/if}
	</Card.Root>
{/if}
