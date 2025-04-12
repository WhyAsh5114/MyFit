<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let isAvailable = $state<boolean>();
	let isAuthorized = $state<boolean>();
	let result = $state<{ startDate: string; endDate: string; value: number }[]>([]);

	onMount(async () => {
		if ('cordova' in window) {
			window.cordova.plugins.health.isAvailable(
				(available) => (isAvailable = available),
				(error) => alert(error)
			);
		} else {
			isAvailable = false;
		}
	});

	$effect(() => {
		if (isAvailable) {
			window.cordova.plugins.health.isAuthorized(
				{ read: ['steps'], write: ['steps'] },
				(authorized) => (isAuthorized = authorized),
				(error) => alert(error)
			);
		}
	});

	$effect(() => {
		if (isAvailable && isAuthorized) {
			window.cordova.plugins.health.query(
				{
					startDate: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // three days ago
					endDate: new Date(), // now
					dataType: 'steps'
				},
				(values) => (result = values),
				(error) => alert(error)
			);
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

{#if isAuthorized === undefined}
	<LoaderCircle class="animate-spin" />
{:else if isAuthorized}
	<p class="text-primary">Platform Sync is authorized</p>
{:else}
	<p class="text-red-500">Platform Sync is not authorized</p>
{/if}

{#each result as item (item.startDate)}
	<div>
		<p>Steps: {item.value}</p>
		<p>Start Date: {new Date(item.startDate).toLocaleString()}</p>
		<p>End Date: {new Date(item.endDate).toLocaleString()}</p>
	</div>
{/each}
