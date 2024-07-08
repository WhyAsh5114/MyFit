<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import WorkoutBasicTab from './(components)/WorkoutBasicTab.svelte';
	import WorkoutExercisesTab from './(components)/WorkoutExercisesTab.svelte';
	import type { FullWorkoutWithMesoData } from './+page.server';

	let { data } = $props();
	let workout: FullWorkoutWithMesoData | null | 'loading' = $state('loading');

	onMount(async () => {
		workout = await data.workout;
		if (workout === null) toast.error('Workout not found');
	});
</script>

<H2>View workout</H2>

{#if workout === 'loading'}
	TODO: skeletons
{:else if workout === null}
	<div class="muted-text-box">Workout not found</div>
{:else}
	<Tabs.Root class="flex w-full grow flex-col" value="basics">
		<Tabs.List class="grid grid-cols-2">
			<Tabs.Trigger value="basics">Basics</Tabs.Trigger>
			<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="basics">
			<WorkoutBasicTab {workout} />
		</Tabs.Content>
		<Tabs.Content class="grow" value="exercises">
			<div class="flex h-full flex-col">
				<WorkoutExercisesTab {workout} />
			</div>
		</Tabs.Content>
	</Tabs.Root>
{/if}
