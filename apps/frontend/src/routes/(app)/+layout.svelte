<script lang="ts">
	import CustomScrollArea from '$lib/components/custom-scroll-area.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from './components/app-sidebar.svelte';
	import LinkBreadcrumbs from './components/link-breadcrumbs.svelte';
	import SessionCacher from './components/session-cacher.svelte';
	import SyncComponent from './components/sync-component.svelte';

	// Renamed because the session cacher hands its own `children` snippet to the layout below.
	let { children: page } = $props();
</script>

<SessionCacher>
	{#snippet children(ownerId)}
		<Sidebar.Provider>
			<AppSidebar />
			<div class="mx-auto flex h-screen w-full max-w-xl flex-col pb-[env(safe-area-inset-bottom)]">
				<header
					class="sticky top-0 z-50 flex min-h-12 items-center gap-2 bg-background/80 px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 backdrop-blur-sm"
				>
					<Sidebar.Trigger />
					<Separator orientation="vertical" class="mr-2 h-6" />
					<LinkBreadcrumbs />
					{#if ownerId}
						<SyncComponent />
					{/if}
				</header>
				<CustomScrollArea class="h-px w-full grow">
					<main class="flex w-full grow flex-col gap-2 p-4 pt-2">
						{@render page?.()}
					</main>
				</CustomScrollArea>
			</div>
		</Sidebar.Provider>
	{/snippet}
</SessionCacher>
