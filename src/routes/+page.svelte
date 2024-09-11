<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import GetStartedComponent from './(components)/page/GetStartedComponent.svelte';
	import TodaysWorkoutCard from './(components)/page/TodaysWorkoutCard.svelte';

	let { data } = $props();
</script>

<H2>Home</H2>

{#if data.todaysWorkoutData}
	<H3>Today's workout</H3>
	<TodaysWorkoutCard {...data} />
{/if}

<GetStartedComponent entityCounts={data.entityCounts} />
