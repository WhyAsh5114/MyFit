<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import type { WorkoutExerciseInProgress } from '$lib/mesoToWorkouts';
	import CheckIcon from 'virtual:icons/lucide/check';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import UndoIcon from 'virtual:icons/lucide/undo';
	import { workoutRunes } from '../../../workoutRunes.svelte';
	import { floorToNearestMultiple } from '$lib/utils';

	type WorkoutExerciseSet = WorkoutExerciseInProgress['sets'][number];

	type PropsType = { reordering: boolean; exercise: WorkoutExerciseInProgress };
	let { reordering, exercise = $bindable() }: PropsType = $props();

	function shouldSetBeDisabled(set: WorkoutExerciseSet, idx: number): boolean {
		if (set.completed) return false;
		if (idx === 0) return false;
		return !exercise.sets[idx - 1].completed;
	}

	function completeSet(e: SubmitEvent, set: WorkoutExerciseSet, idx: number) {
		e.preventDefault();
		if (set.skipped) {
			set.skipped = false;
			return;
		}
		set.completed = !set.completed;
		workoutRunes.workoutExercises = workoutRunes.workoutExercises;
	}

	function calculateNextLoad(setIdx: number) {
		const firstSet = exercise.sets[0];
		if (firstSet.load === undefined) return 0;
		if (!exercise.changeType || setIdx === 0) return 0;
		if (exercise.changeAmount === null || exercise.changeAmount === undefined) return 0;

		if (exercise.setType === 'Down') setIdx = -setIdx;
		if (exercise.changeType === 'AbsoluteLoad') {
			return firstSet.load + setIdx * exercise.changeAmount;
		}
		return firstSet.load * (1 + setIdx * (exercise.changeAmount / 100));
	}

	function getNextLoad(setIdx: number) {
		return floorToNearestMultiple(
			calculateNextLoad(setIdx),
			exercise.minimumWeightChange ?? 5
		).toString();
	}
</script>

{#if !reordering}
	<Separator class="my-1" />
	<div class="grid grid-cols-4 gap-1">
		<span class="text-center text-sm font-medium">Reps</span>
		<span class="text-center text-sm font-medium">Load</span>
		<span class="text-center text-sm font-medium">RIR</span>
		<span></span>
		{#each exercise.sets as set, idx}
			<form class="contents" onsubmit={(e) => completeSet(e, set, idx)}>
				{#if !set.skipped}
					<Input
						type="number"
						min={0}
						id="{exercise.name}-set-{idx + 1}-reps"
						disabled={set.completed || set.skipped}
						required
						bind:value={set.reps}
					/>
					<Input
						type="number"
						min={0}
						id="{exercise.name}-set-{idx + 1}-load"
						placeholder={getNextLoad(idx)}
						disabled={set.completed || set.skipped}
						required
						bind:value={set.load}
					/>
					<Input
						type="number"
						min={0}
						id="{exercise.name}-set-{idx + 1}-RIR"
						disabled={set.completed || set.skipped}
						required
						bind:value={set.RIR}
					/>
				{:else}
					<div class="col-span-3 flex items-center gap-2">
						<Separator class="w-px grow" />
						<span class="text-sm text-muted-foreground">skipped</span>
						<Separator class="w-px grow" />
					</div>
				{/if}
				<Button
					size="icon"
					class="place-self-end"
					type="submit"
					variant={set.completed ? 'outline' : 'default'}
					disabled={shouldSetBeDisabled(set, idx)}
				>
					{#if set.skipped}
						<UndoIcon />
					{:else if !set.completed}
						<CheckIcon />
					{:else}
						<EditIcon />
					{/if}
				</Button>
			</form>
		{/each}
	</div>
{/if}
