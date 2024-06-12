<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import {
		mesocycleRunes,
		type MesocycleCyclicSetChangesWithoutIDs
	} from '../../mesocycleRunes.svelte';

	const maxMinSetsValue = Math.min(
		...mesocycleRunes.mesocycleCyclicSetChanges.map((setChange) => setChange.startVolume)
	);
	let minSets = $state(3);

	function distributeStartVolumes(e: SubmitEvent) {
		e.preventDefault();
		mesocycleRunes.mesocycleCyclicSetChanges.forEach((setChange) => {
			const muscleGroupTargetedOnDays = getMuscleGroupTargetedOnDaysArray(setChange);
			const startVolumeDistributionAcrossDays = distributeEvenly(
				setChange.startVolume,
				muscleGroupTargetedOnDays.length
			);
			for (let i = 0; i < startVolumeDistributionAcrossDays.length; i++) {
				const dayVolume = startVolumeDistributionAcrossDays[i];
				const targetingExercises = mesocycleRunes.mesocycleExerciseTemplates[
					muscleGroupTargetedOnDays[i]
				].filter((exercise) =>
					mesocycleRunes.isExerciseAndSetChangeMuscleSame(exercise, setChange)
				);
				const exerciseVolumeDistribution = distributeEvenly(
					dayVolume,
					targetingExercises.length,
					minSets
				);
				targetingExercises.forEach((exercise, idx) => {
					exercise.sets = exerciseVolumeDistribution[idx];
				});
			}
		});
		mesocycleRunes.saveStoresToLocalStorage();
	}

	function getTrueIndexes(boolArray: boolean[]): number[] {
		return boolArray.map((value, index) => (value ? index : -1)).filter((index) => index !== -1);
	}

	function getMuscleGroupTargetedOnDaysArray(setChange: MesocycleCyclicSetChangesWithoutIDs) {
		return getTrueIndexes(
			mesocycleRunes.mesocycleExerciseTemplates.map((exerciseTemplates) => {
				return exerciseTemplates.some((exercise) =>
					mesocycleRunes.isExerciseAndSetChangeMuscleSame(exercise, setChange)
				);
			})
		);
	}

	function distributeEvenly(volume: number, n: number, minValue: number = 0): number[] {
		let distribution = Array(n).fill(0);
		let remainingVolume = volume;

		if (minValue > 0) {
			for (let i = 0; i < n; i++) {
				if (remainingVolume >= minValue) {
					distribution[i] = minValue;
					remainingVolume -= minValue;
				} else break;
			}
		}

		const base = Math.floor(remainingVolume / n);
		const remainder = remainingVolume % n;
		for (let i = 0; i < n; i++) distribution[i] += base;
		for (let i = 0; i < remainder; i++) distribution[i] += 1;

		return distribution;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Distribute volume</Card.Title>
		<Card.Description>
			Use this tab to spread start volumes across exercises in the exercise split
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form class="flex w-full max-w-sm flex-col gap-1.5" onsubmit={distributeStartVolumes}>
			<Label for="distribution-min-sets-per-exercise">Minimum sets per exercise</Label>
			<div class="flex gap-1">
				<Input
					type="number"
					step={1}
					min={0}
					max={maxMinSetsValue}
					id="distribution-min-sets-per-exercise"
					placeholder="Type here"
					required
					bind:value={minSets}
				/>
				<Button class="ml-auto" type="submit">Distribute</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>

<div class="muted-text-box prose mt-2 text-sm">
	<ul>
		<li>We recommend you to at least have 3 minimum sets per exercise, in some cases 2</li>
		<li>
			This prevents excessive usage of exercise variation giving you room to change things up later
			when needed
		</li>
		<li>
			You can keep exercises with 0 sets in the split. They'll show up later in the mesocycle as
			volume increases
		</li>
	</ul>
</div>
