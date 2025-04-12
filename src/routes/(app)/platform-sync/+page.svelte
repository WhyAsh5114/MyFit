<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let isAvailable = $state<boolean>();

	onMount(async () => {
		const { Health } = await import('@awesome-cordova-plugins/health');
		try {
			isAvailable = await Health.isAvailable();
		} catch {
			isAvailable = false;
		}
	});
</script>

<H1>Platform Sync</H1>

{#if isAvailable === undefined}
	<LoaderCircle class="animate-spin" />
{:else if isAvailable}
	<p class="text-primary">Platform Sync is available</p>
{:else}
	<p class="text-red-500">Platform Sync is not available</p>
{/if}
