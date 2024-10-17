<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { arrayAverage } from '$lib/utils';
	import {
		cleanupInProgressMiniSets,
		solveBergerFormula,
		type WorkoutExerciseInProgress
	} from '$lib/utils/workoutUtils';
	import DownIcon from 'virtual:icons/lucide/chevron-down';
	import UpIcon from 'virtual:icons/lucide/chevron-up';
	import Minus from 'virtual:icons/lucide/minus';
	import TrendDownIcon from 'virtual:icons/lucide/trending-down';
	import TrendUpIcon from 'virtual:icons/lucide/trending-up';
	import { workoutRunes } from '../../workoutRunes.svelte';

	type PropsType = { exercise: WorkoutExerciseInProgress };
	let { exercise }: PropsType = $props();

	let prevExercise = workoutRunes.previousWorkoutData?.exercises.find((ex) => ex.name === exercise.name);

	function getTheoreticalVolumeChange(setIdx: number) {
		const prevSet = prevExercise?.sets[setIdx];
		const currentSet = exercise.sets[setIdx];

		if (!prevSet) return;
		if (!currentSet) return;
		if (currentSet.skipped || prevSet.skipped) return;

		if (!isSetCompleted(currentSet)) return;
		let { reps, load, RIR, miniSets } = currentSet;

		const actualOverload = solveBergerFormula({
			variableToSolve: 'OverloadPercentage',
			knownValues: {
				oldSet: prevSet,
				newSet: { reps, load, RIR, miniSets: cleanupInProgressMiniSets(miniSets) },
				newUserBodyweight: workoutRunes.workoutData?.userBodyweight as number,
				oldUserBodyweight: workoutRunes.previousWorkoutData?.userBodyweight,
				bodyweightFraction: exercise.bodyweightFraction ?? null
			}
		});
		console.log(actualOverload);

		return actualOverload;
	}

	function getAverageVolumeChangeOfAllSets() {
		if (!prevExercise) return;
		return arrayAverage(
			prevExercise.sets.map((_, idx) => getTheoreticalVolumeChange(idx)).filter((v) => v !== undefined)
		);
	}

	type InProgressSet = { reps?: number; load?: number; RIR?: number; completed: boolean };
	type CompletedSet = { reps: number; load: number; RIR: number; completed: boolean };

	function isSetCompleted(miniSet: InProgressSet): miniSet is CompletedSet {
		const { reps, load, RIR } = miniSet;
		return reps !== undefined && load !== undefined && RIR !== undefined;
	}

	function getTheoreticalVolumeChangeOfMiniSet(prev: Omit<CompletedSet, 'completed'>, current: InProgressSet) {
		if (!isSetCompleted(current)) return;

		const actualOverload = solveBergerFormula({
			variableToSolve: 'OverloadPercentage',
			knownValues: {
				oldSet: { ...prev, miniSets: [] },
				newSet: { ...current, miniSets: [] },
				newUserBodyweight: workoutRunes.workoutData?.userBodyweight as number,
				oldUserBodyweight: workoutRunes.previousWorkoutData?.userBodyweight,
				bodyweightFraction: exercise.bodyweightFraction ?? null
			}
		});
		return actualOverload;
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
			{#if !isNaN(Number(totalVolumeChange)) && totalVolumeChange !== undefined}
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
			{@const prevSet = prevExercise.sets[idx]}
			{#if prevSet && !prevSet.skipped && !set.skipped}
				{@const volumeChange = getTheoreticalVolumeChange(idx)}
				<p>
					{#if prevSet.reps !== set.reps}
						<span class="text-muted-foreground">{prevSet.reps} -&gt;</span>
					{/if}
					{set.reps}
				</p>
				<p>
					{#if prevSet.load !== set.load}
						<span class="text-muted-foreground">{prevSet.load} -&gt;</span>
					{/if}
					{set.load}
				</p>
				<p>
					{#if prevSet.RIR !== set.RIR}
						<span class="text-muted-foreground">{prevSet.RIR} -&gt;</span>
					{/if}
					{set.RIR}
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
				{#each set.miniSets as miniSet, miniSetIdx}
					{@const prevMiniSet = prevExercise.sets[idx].miniSets[miniSetIdx]}
					{@const miniSetVolumeChange = getTheoreticalVolumeChangeOfMiniSet(prevMiniSet, miniSet)}
					{#if prevMiniSet}
						<p class="text-sm font-light italic">
							{#if prevMiniSet.reps !== miniSet.reps}
								<span class="text-muted-foreground">{prevMiniSet.reps} -&gt;</span>
							{/if}
							{miniSet.reps}
						</p>
						<p class="text-sm font-light italic">
							{#if prevMiniSet.load !== miniSet.load}
								<span class="text-muted-foreground">{prevMiniSet.load} -&gt;</span>
							{/if}
							{miniSet.load}
						</p>
						<p class="text-sm font-light italic">
							{#if prevMiniSet.RIR !== miniSet.RIR}
								<span class="text-muted-foreground">{prevMiniSet.RIR} -&gt;</span>
							{/if}
							{miniSet.RIR}
						</p>
						<span class="flex w-full items-center justify-end gap-1 text-xs font-light italic">
							{#if typeof miniSetVolumeChange === 'number'}
								<span>{miniSetVolumeChange?.toFixed(2)}%</span>
								{#if miniSetVolumeChange < 0}
									<DownIcon class="justify-self-end" />
								{:else if miniSetVolumeChange > 0}
									<UpIcon class="justify-self-end" />
								{:else}
									<Minus class="justify-self-end" />
								{/if}
							{/if}
						</span>
					{:else}
						<Separator />
						<span class="text-center text-sm text-muted-foreground">new mini set</span>
						<Separator />
						<span></span>
					{/if}
				{/each}
			{:else}
				<Separator />
				<span class="text-center text-sm text-muted-foreground">
					{#if set.skipped}
						skipped
					{:else if prevSet?.skipped}
						skipped last time
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
