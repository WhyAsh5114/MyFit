<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import DOMPurify from 'dompurify';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import ReloadIcon from 'virtual:icons/lucide/refresh-ccw';
	import { needRefresh, updateDataLossDialog } from './PWAFunctions.svelte';

	let open = $state(false);
	let dialogText = $state<string>();
	let latestRelease = $state<{ tag_name: string; body: string }>();

	onMount(async () => {
		const response = await fetch('https://api.github.com/repos/WhyAsh5114/MyFit/releases/latest');
		latestRelease = await response.json();

		const ls = window.localStorage;
		const changelogShownOf = ls.getItem('changelogShownOf');
		if (
			changelogShownOf &&
			changelogShownOf.localeCompare(latestRelease!.tag_name, undefined, { numeric: true }) === -1
		) {
			open = true;
			loadChangelog();
		}
		ls.setItem('changelogShownOf', latestRelease!.tag_name);
	});

	async function loadChangelog() {
		dialogText = DOMPurify.sanitize(await marked.parse(latestRelease!.body));
	}
</script>

<ResponsiveDialog title="What's new?" bind:open dismissible={false}>
	{#if dialogText}
		<ScrollArea class="h-96">
			<article class="prose prose-sm dark:prose-invert">
				{@html dialogText}
			</article>
		</ScrollArea>
		<Button disabled={!$needRefresh} class="gap-2" onclick={() => (updateDataLossDialog.open = true)}>
			{#if !$needRefresh}
				Fetching update <LoaderCircle class="animate-spin" />
			{:else}
				Update & reload <ReloadIcon />
			{/if}
		</Button>
	{:else}
		<div class="flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground">
			<LoaderCircle class="animate-spin" />
			<span>Loading changelog</span>
		</div>
	{/if}
</ResponsiveDialog>
