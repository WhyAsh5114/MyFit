<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import type { WorkoutExerciseInProgress } from '$lib/mesoToWorkouts';
	import { workoutRunes } from '../../../workoutRunes.svelte';
	import CheckIcon from 'virtual:icons/lucide/check';
	import EditIcon from 'virtual:icons/lucide/pencil';

	type PropsType = { reordering: boolean; exercise: WorkoutExerciseInProgress };
	let { reordering, exercise = $bindable() }: PropsType = $props();

	function shouldSetBeDisabled(
		set: WorkoutExerciseInProgress['sets'][number],
		idx: number
	): boolean {
		if (set.completed) return false;
		if (idx === 0) return false;
		return !exercise.sets[idx - 1].completed;
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
			<form
				class="contents"
				onsubmit={(e) => {
					e.preventDefault();
					set.completed = !set.completed;
					workoutRunes.workoutExercises = workoutRunes.workoutExercises;
				}}
			>
				<Input
					type="number"
					min={0}
					id="{exercise.name}-set-{idx + 1}-reps"
					disabled={set.completed}
					required
					bind:value={set.reps}
				/>
				<Input
					type="number"
					min={0}
					id="{exercise.name}-set-{idx + 1}-load"
					disabled={set.completed}
					required
					bind:value={set.load}
				/>
				<Input
					type="number"
					min={0}
					id="{exercise.name}-set-{idx + 1}-RIR"
					disabled={set.completed}
					required
					bind:value={set.RIR}
				/>
				<Button
					size="icon"
					class="place-self-end"
					type="submit"
					variant={set.completed ? 'outline' : 'default'}
					disabled={shouldSetBeDisabled(set, idx)}
				>
					{#if !set.completed}
						<CheckIcon />
					{:else}
						<EditIcon />
					{/if}
				</Button>
			</form>
		{/each}
	</div>
{/if}
