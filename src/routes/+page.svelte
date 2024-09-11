<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { onMount } from 'svelte';
	import GetStartedComponent from './(components)/page/GetStartedComponent.svelte';
	import TodaysWorkoutCard from './(components)/page/TodaysWorkoutCard.svelte';

	let { data } = $props();
	let entityCounts: RouterOutputs['users']['getEntityCounts'] | 'loading' = $state('loading');

	onMount(async () => {
		if (data.entityCounts === undefined) {
			entityCounts = null;
			return;
		}
		entityCounts = await data.entityCounts;
	});
</script>

<H2>Home</H2>

{#if data.todaysWorkoutData}
	<H3>Today's workout</H3>
	<TodaysWorkoutCard {...data} />
{/if}

{#if entityCounts === 'loading'}
	TODO: skeletons
{:else}
	<GetStartedComponent {entityCounts} />
{/if}
