<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let open = $state(false);
	let dialogText = $state<string>();

	onMount(() => {
		const ls = window.localStorage;
		if (ls.getItem('changelogShown') !== 'true') {
			open = true;
			loadChangelog();
			ls.setItem('changelogShown', 'true');
		}
	});

	async function loadChangelog() {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const response = await fetch('https://api.github.com/repos/WhyAsh5114/MyFit/releases/latest');
		const data = await response.json();
		dialogText = DOMPurify.sanitize(await marked.parse(data.body));
	}
</script>

<ResponsiveDialog title="What's new?" bind:open>
	{#if dialogText}
		<ScrollArea class="h-96">
			<article class="prose prose-sm dark:prose-invert">
				{@html dialogText}
			</article>
		</ScrollArea>
	{:else}
		<div class="flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground">
			<LoaderCircle class="animate-spin" />
			<span>Loading changelog</span>
		</div>
	{/if}
</ResponsiveDialog>
