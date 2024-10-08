<script lang="ts">
	import { solveBrzyckiFormula, type WorkoutExerciseInProgress } from '$lib/utils/workoutUtils';
	import * as Popover from '$lib/components/ui/popover';
	import { workoutRunes } from '../../workoutRunes.svelte';
	import TrendUpIcon from 'virtual:icons/lucide/trending-up';
	import UpIcon from 'virtual:icons/lucide/chevron-up';
	import TrendDownIcon from 'virtual:icons/lucide/trending-down';
	import DownIcon from 'virtual:icons/lucide/chevron-down';
	import Minus from 'virtual:icons/lucide/minus';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { arrayAverage } from '$lib/utils';

	type PropsType = { exercise: WorkoutExerciseInProgress };
	let { exercise }: PropsType = $props();

	let prevExercise = workoutRunes.previousWorkoutData?.exercises.find((ex) => ex.name === exercise.name);

	function getTheoreticalVolumeChange(setIdx: number) {
		const prevSet = prevExercise?.sets[setIdx];
		if (!prevSet) return;
		if (!exercise.sets[setIdx]) return;

		let { reps, load, RIR } = exercise.sets[setIdx];
		if (reps === undefined || load === undefined || RIR === undefined) return;

		const actualOverload = solveBrzyckiFormula({
			variableToSolve: 'OverloadPercentage',
			knownValues: {
				oldSet: prevSet,
				newSet: { reps, load, RIR },
				newUserBodyweight: workoutRunes.workoutData?.userBodyweight as number,
				oldUserBodyweight: workoutRunes.previousWorkoutData?.userBodyweight,
				bodyweightFraction: exercise.bodyweightFraction ?? null
			}
		});

		return actualOverload;
	}

	function getAverageVolumeChangeOfAllSets() {
		if (!prevExercise) return;
		return arrayAverage(
			prevExercise.sets.map((_, idx) => getTheoreticalVolumeChange(idx)).filter((v) => v !== undefined)
		);
	}

	let totalVolumeChange = $derived(getAverageVolumeChangeOfAllSets());
</script>

{#if prevExercise}
	<div class="custom-grid grid grid-cols-4 place-items-center gap-y-2">
		<span class="text-sm font-medium">Reps</span>
		<span class="text-sm font-medium">
			Load
			{#if exercise.bodyweightFraction !== null}
				<Popover.Root>
					<Popover.Trigger class="text-xs font-semibold text-muted-foreground underline">(BW)</Popover.Trigger>
					<Popover.Content class="w-48 text-center text-base">
						<span class="text-muted-foreground">
							{workoutRunes.previousWorkoutData?.userBodyweight} -&gt;
						</span>
						{workoutRunes.workoutData?.userBodyweight}
					</Popover.Content>
				</Popover.Root>
			{/if}
		</span>
		<span class="text-sm font-medium">RIR</span>
		<span class="flex w-full items-center justify-end gap-1 text-sm font-semibold">
			{#if totalVolumeChange !== undefined}
				{totalVolumeChange.toFixed(2)}%
				{#if totalVolumeChange < 0}
					<TrendDownIcon class="justify-self-end" />
				{:else if totalVolumeChange > 0}
					<TrendUpIcon class="justify-self-end" />
				{:else}
					<Minus class="justify-self-end" />
				{/if}
			{/if}
		</span>
		{#each exercise.sets as set, idx}
			{#if prevExercise.sets[idx] && !set.skipped}
				{@const volumeChange = getTheoreticalVolumeChange(idx)}
				<p>
					{#if prevExercise.sets[idx].reps !== set.reps}
						<span class="text-muted-foreground">{prevExercise.sets[idx].reps} -&gt;</span>
						{set.reps}
					{:else}
						{set.reps}
					{/if}
				</p>
				<p>
					{#if prevExercise.sets[idx].load !== set.load}
						<span class="text-muted-foreground">{prevExercise.sets[idx].load} -&gt;</span>
						{set.load}
					{:else}
						{set.load}
					{/if}
				</p>
				<p>
					{#if prevExercise.sets[idx].RIR !== set.RIR}
						<span class="text-muted-foreground">{prevExercise.sets[idx].RIR} -&gt;</span>
						{set.RIR}
					{:else}
						{set.RIR}
					{/if}
				</p>
				<span class="flex w-full items-center justify-end gap-1 text-sm font-light">
					{#if typeof volumeChange === 'number'}
						<span>{volumeChange?.toFixed(2)}%</span>
						{#if volumeChange < 0}
							<DownIcon class="justify-self-end" />
						{:else if volumeChange > 0}
							<UpIcon class="justify-self-end" />
						{:else}
							<Minus class="justify-self-end" />
						{/if}
					{/if}
				</span>
				<!-- #85 -->
			{:else}
				<Separator />
				<span class="text-sm text-muted-foreground">
					{#if set.skipped}
						skipped
					{:else}
						new set
					{/if}
				</span>
				<Separator />
				<span></span>
			{/if}
		{/each}
	</div>
{:else}
	<span class="text-center text-sm">Reference exercise not found</span>
{/if}

<style lang="postcss">
	.custom-grid {
		grid-template-columns: 1fr 1.25fr 1fr 1fr;
	}
</style>
