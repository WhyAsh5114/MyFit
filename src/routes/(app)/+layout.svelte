<script lang="ts">
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import AppSidebar from './components/app-sidebar.svelte';
	import LinkBreadcrumbs from './components/link-breadcrumbs.svelte';
	import SessionCacher from './components/session-cacher.svelte';
	import SwEventsHandler from './components/sw-events-handler.svelte';

	let { children } = $props();
</script>

<Toaster />
<SwEventsHandler />
<SessionCacher />

<Sidebar.Provider>
	<AppSidebar />
	<ScrollArea class="mx-auto h-screen w-full max-w-xl">
		<header
			class="bg-background/80 sticky top-0 z-50 flex min-h-12 items-center gap-2 px-4 backdrop-blur-sm"
		>
			<Sidebar.Trigger />
			<Separator orientation="vertical" class="mr-2 h-6" />
			<LinkBreadcrumbs />
		</header>
		<main class="flex w-full grow flex-col gap-4 p-4">
			{@render children?.()}
		</main>
	</ScrollArea>
</Sidebar.Provider>
