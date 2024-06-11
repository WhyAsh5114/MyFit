<script lang="ts">
	import { onMount } from 'svelte';
	import type { FullExerciseSplit } from '../../../exercise-splits/manage/exerciseSplitRunes.svelte';
	import { toast } from 'svelte-sonner';
	import {
		mesocycleRunes,
		type MesocycleExerciseTemplateWithoutIDs
	} from '../mesocycleRunes.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card/index.js';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import MesocycleStartVolumesExercisesTabs from './(components)/MesocycleStartVolumesExercisesTabs.svelte';

	let { data } = $props();
	let exerciseSplit: FullExerciseSplit | 'loading' = $state('loading');
	let mesocycleExerciseTemplates: MesocycleExerciseTemplateWithoutIDs[][] = $state([]);

	onMount(async () => {
		const serverExerciseSplit = await data.exerciseSplit;
		if (!serverExerciseSplit) toast.error('Exercise split not found');
		else {
			exerciseSplit = serverExerciseSplit;
			mesocycleRunes.selectedExerciseSplit = exerciseSplit;
			mesocycleExerciseTemplates = serverExerciseSplit.exerciseSplitDays.map((splitDay) => {
				return splitDay.exercises.map((exercise) => {
					const mesocycleExerciseTemplate: MesocycleExerciseTemplateWithoutIDs & { id?: number } = {
						...exercise,
						sets: 0
					};
					delete mesocycleExerciseTemplate.id;
					return mesocycleExerciseTemplate;
				});
			});
		}
	});
</script>

<H3>Start volumes</H3>
{#if exerciseSplit !== 'loading'}
	<Tabs.Root value="distribute" class="flex w-full grow flex-col">
		<Tabs.List class="grid grid-cols-2">
			<Tabs.Trigger value="distribute">Distribute</Tabs.Trigger>
			<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="distribute">
			<Card.Root>
				<Card.Header>
					<Card.Title>Distribute volume</Card.Title>
					<Card.Description>
						Use this dialog to spread volumes across exercises in the exercise split
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<p>Card Content</p>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="exercises" class="grow">
			<MesocycleStartVolumesExercisesTabs {exerciseSplit} bind:mesocycleExerciseTemplates />
		</Tabs.Content>
	</Tabs.Root>
{/if}
