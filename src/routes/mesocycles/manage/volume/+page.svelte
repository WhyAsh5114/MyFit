<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { FullExerciseSplit } from '../../../exercise-splits/manage/exerciseSplitRunes.svelte';
	import { mesocycleRunes } from '../mesocycleRunes.svelte';
	import MesocycleStartVolumesExercisesTabs from './(components)/MesocycleStartVolumesExercisesTabs.svelte';
	import MesocycleVolumeSetupTable from './(components)/MesocycleVolumeSetupTable.svelte';

	let { data } = $props();
	let exerciseSplit: FullExerciseSplit | 'loading' = $state('loading');

	onMount(async () => {
		const serverExerciseSplit = await data.exerciseSplit;
		if (!serverExerciseSplit) toast.error('Exercise split not found');
		else {
			exerciseSplit = serverExerciseSplit;
			mesocycleRunes.selectedExerciseSplit = exerciseSplit;
		}
	});
</script>

<H3>Volume</H3>
{#if exerciseSplit !== 'loading'}
	<Tabs.Root value="setup" class="flex w-full grow flex-col">
		<Tabs.List class="grid grid-cols-3">
			<Tabs.Trigger value="setup">Setup</Tabs.Trigger>
			<Tabs.Trigger value="distribute">Distribute</Tabs.Trigger>
			<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="setup" class="grow">
			<div class="flex h-full flex-col">
				<MesocycleVolumeSetupTable />
			</div>
		</Tabs.Content>
		<Tabs.Content value="distribute" class="grow">
			<Card.Root>
				<Card.Header>
					<Card.Title>Distribute volume</Card.Title>
					<Card.Description>
						Use this dialog to spread volumes across exercises in the exercise split
					</Card.Description>
				</Card.Header>
				<Card.Content>Card content</Card.Content>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="exercises" class="grow">
			<MesocycleStartVolumesExercisesTabs />
		</Tabs.Content>
	</Tabs.Root>
{/if}
