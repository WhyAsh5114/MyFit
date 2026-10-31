<script lang="ts">
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { accountSession } from '#lib/features/account/account-session.svelte.js';
	import AppSidebar from './components/app-sidebar.svelte';
	import LinkBreadcrumbs from './components/link-breadcrumbs.svelte';
	import SyncComponent from './components/sync-component.svelte';

	let { children, data } = $props();

	// Pages show only while the account is ready and their data was read for it, so a switch never
	// leaves the other account's data on screen.
	const showing = $derived(
		accountSession.ownerId !== undefined && data.ownerId === accountSession.ownerId
	);
</script>

{#if showing}
	<Sidebar.Provider>
		<AppSidebar />
		<div class="mx-auto flex h-dvh w-full max-w-xl flex-col pb-[env(safe-area-inset-bottom)]">
			<header
				class="sticky top-0 z-50 flex min-h-12 items-center gap-3 bg-background/80 px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 backdrop-blur-sm"
			>
				<Sidebar.Trigger />
				<Separator orientation="vertical" class="mr-2 h-full" />
				<LinkBreadcrumbs />
				{#if data.ownerId}
					<SyncComponent />
				{/if}
			</header>
			<div class="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
				<main class="flex w-full grow flex-col gap-2 p-4 pt-2">
					{@render children?.()}
				</main>
			</div>
		</div>
	</Sidebar.Provider>
{/if}
