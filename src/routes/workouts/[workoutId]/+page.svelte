<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import BasicsTabContent from './(components)/BasicsTabContent.svelte';
	import type { WorkoutWithMesoData } from '../+page.server';

	let { data } = $props();
	let workout: WorkoutWithMesoData | null | 'loading' = $state('loading');

	onMount(async () => {
		workout = await data.workout;
		if (workout === null) toast.error('Workout not found');
		console.log(workout);
	});
</script>

<H2>View workout</H2>

{#if workout === 'loading'}
	TODO: skeletons
{:else if workout === null}
	<div class="muted-text-box">Workout not found</div>
{:else}
	<Tabs.Root class="w-full" value="basics">
		<Tabs.List class="grid grid-cols-2">
			<Tabs.Trigger value="basics">Basics</Tabs.Trigger>
			<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="basics">
			<BasicsTabContent {workout} />
		</Tabs.Content>
		<Tabs.Content value="exercises">Change your password here.</Tabs.Content>
	</Tabs.Root>
{/if}
