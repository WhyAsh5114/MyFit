<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import DOMPurify from 'dompurify';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import ReloadIcon from 'virtual:icons/lucide/refresh-ccw';
	import { checkForUpdates, needRefresh, updateDataLossDialog } from './PWAFunctions.svelte';

	let open = $state(false);
	let checkingForUpdate = $state(false);
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
			checkingForUpdate = true;
			while (checkForUpdates === null) {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
			await checkForUpdates();
			checkingForUpdate = false;
			loadChangelog(changelogShownOf);
		}
		ls.setItem('changelogShownOf', latestRelease!.tag_name);
	});

	async function loadChangelog(lastRelease: string) {
		const notShownReleases = releases.filter(
			(release) => release.tag_name.localeCompare(lastRelease, undefined, { numeric: true }) === 1
		);

		dialogText = '';
		for (const release of notShownReleases) {
			dialogText += DOMPurify.sanitize(await marked.parse(release.body));
			dialogText += '<hr>';
		}
	}
</script>

<ResponsiveDialog title="What's new?" bind:open dismissible={false}>
	{#if dialogText}
		<ScrollArea class="h-96">
			<article class="prose prose-sm dark:prose-invert">
				{@html dialogText}
			</article>
		</ScrollArea>
		<Button
			disabled={checkingForUpdate}
			class="gap-2"
			onclick={() => {
				if ($needRefresh) updateDataLossDialog.open = true;
				else open = false;
			}}
		>
			{#if checkingForUpdate}
				Fetching update <LoaderCircle class="animate-spin" />
			{:else if $needRefresh}
				Update & reload <ReloadIcon />
			{:else}
				Already at the latest version 🎉
			{/if}
		</Button>
	{:else}
		<div class="flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground">
			<LoaderCircle class="animate-spin" />
			<span>Loading changelog</span>
		</div>
	{/if}
</ResponsiveDialog>
