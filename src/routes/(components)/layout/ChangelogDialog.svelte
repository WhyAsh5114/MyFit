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
	let releases = $state<{ tag_name: string; body: string }[]>([]);

	onMount(async () => {
		const response = await fetch('https://api.github.com/repos/WhyAsh5114/MyFit/releases');
		releases = await response.json();
		const latestRelease = releases[0];

		const ls = window.localStorage;
		const changelogShownOf = ls.getItem('changelogShownOf');
		if (
			changelogShownOf &&
			changelogShownOf.localeCompare(latestRelease!.tag_name, undefined, { numeric: true }) === -1
		) {
			open = true;
			await loadChangelog(changelogShownOf);
		}
		ls.setItem('changelogShownOf', latestRelease!.tag_name);
	});

	async function loadChangelog(lastRelease: string) {
		const notShownReleases = releases.filter(
			(release) => release.tag_name.localeCompare(lastRelease, undefined, { numeric: true }) === 1
		);

		let text = '';
		for (let i = 0; i < notShownReleases.length; i++) {
			text += DOMPurify.sanitize(await marked.parse(releases[i].body));
			if (i !== notShownReleases.length - 1) dialogText += '<hr>';
		}
		dialogText = text;
	}
</script>

{#if $needRefresh}
	<ResponsiveDialog title="What's new?" bind:open dismissible={false}>
		{#if dialogText}
			<ScrollArea class="h-96">
				<article class="prose prose-sm dark:prose-invert">
					{@html dialogText}
				</article>
			</ScrollArea>
			<Button
				class="gap-2"
				onclick={() => {
					if ($needRefresh) {
						open = false;
						updateDataLossDialog.open = true;
					} else open = false;
				}}
			>
				Update & reload <ReloadIcon />
			</Button>
		{:else}
			<div class="flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground">
				<LoaderCircle class="animate-spin" />
				<span>Loading changelog</span>
			</div>
		{/if}
	</ResponsiveDialog>
{/if}
