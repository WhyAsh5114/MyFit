<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import type { WorkoutExerciseInProgress } from '$lib/workoutFunctions';
	import { workoutRunes } from '../../../workoutRunes.svelte';
	import CheckIcon from 'virtual:icons/lucide/check';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import UndoIcon from 'virtual:icons/lucide/undo';
	import AddIcon from 'virtual:icons/lucide/plus';
	import RemoveIcon from 'virtual:icons/lucide/minus';

	type WorkoutExerciseSet = WorkoutExerciseInProgress['sets'][number];

	type PropsType = { reordering: boolean; exercise: WorkoutExerciseInProgress };
	let { reordering, exercise = $bindable() }: PropsType = $props();

	function shouldSetBeDisabled(set: WorkoutExerciseSet, idx: number): boolean {
		if (set.completed) return false;
		if (idx === 0) return false;
		const previousSet = exercise.sets[idx - 1];
		if (previousSet.miniSets.length === 0) return !previousSet.completed;
		return !previousSet.miniSets[previousSet.miniSets.length - 1].completed;
	}

	function shouldMiniSetBeDisabled(setIndex: number, miniSetIndex: number) {
		const parentSet = exercise.sets[setIndex];
		if (miniSetIndex === 0) return !parentSet.completed;
		return !parentSet.miniSets[miniSetIndex - 1].completed;
	}

	function addMiniSet(setIndex: number) {
		exercise.sets[setIndex].miniSets.push({
			completed: false,
			reps: undefined,
			load: exercise.sets[setIndex].load,
			RIR: undefined
		});
	}

	function completeMiniSet(e: SubmitEvent, set: WorkoutExerciseSet, miniSetIndex: number) {
		e.preventDefault();
		set.miniSets[miniSetIndex].completed = !set.miniSets[miniSetIndex].completed;
		workoutRunes.workoutExercises = workoutRunes.workoutExercises;
	}

	function completeSet(e: SubmitEvent, set: WorkoutExerciseSet, idx: number) {
		e.preventDefault();
		if (set.skipped) {
			set.skipped = false;
			return;
		}
		set.completed = !set.completed;
		// If first set of straight set, set all loads of all sets to this set's load
		if (idx === 0) exercise.sets.forEach((_set) => (_set.load = set.load));
		workoutRunes.workoutExercises = workoutRunes.workoutExercises;
	}
</script>

{#if !reordering}
	<Separator class="my-1" />
	<div class="grid grid-cols-4 gap-1">
		<span class="text-center text-sm font-medium">Reps</span>
		<span class="text-center text-sm font-medium">
			Load
			{#if exercise.involvesBodyweight}
				<span class="text-xs font-semibold text-muted-foreground">(BW)</span>
			{/if}
		</span>
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
					{#if idx === 0}
						<Input
							type="number"
							min={0}
							id="{exercise.name}-set-{idx + 1}-load"
							disabled={set.completed || set.skipped}
							required
							bind:value={set.load}
						/>
					{:else}
						<span></span>
					{/if}
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
			{#if idx > 0}
				{#each set.miniSets as miniSet, miniIdx}
					{@const miniSetButtonDisabled = shouldMiniSetBeDisabled(idx, miniIdx)}
					{#if set.skipped}
						<div class="col-span-3 flex items-center gap-2">
							<Separator class="w-px grow" />
							<span class="text-sm text-muted-foreground">skipped</span>
							<Separator class="w-px grow" />
						</div>
						<Button size="icon" class="place-self-end" variant="secondary" disabled>
							<CheckIcon />
						</Button>
					{:else}
						<form class="contents" onsubmit={(e) => completeMiniSet(e, set, miniIdx)}>
							<Input
								type="number"
								min={0}
								id="{exercise.name}-set-{idx + 1}-mini-set-{miniIdx + 1}-reps"
								disabled={miniSet.completed}
								required
								bind:value={miniSet.reps}
							/>
							<span></span>
							<Input
								type="number"
								min={0}
								id="{exercise.name}-set-{idx + 1}-mini-set-{miniIdx + 1}-RIR"
								disabled={miniSet.completed}
								required
								bind:value={miniSet.RIR}
							/>
							<Button
								size="icon"
								class="place-self-end"
								disabled={miniSetButtonDisabled}
								type="submit"
								variant={miniSet.completed ? 'outline' : 'default'}
							>
								{#if !miniSet.completed}
									<CheckIcon />
								{:else}
									<EditIcon />
								{/if}
							</Button>
						</form>
					{/if}
				{/each}
				<Button
					variant="secondary"
					aria-label="add-mini-set-to-set-{idx + 1}-of-{exercise.name}"
					onclick={() => addMiniSet(idx)}
				>
					<AddIcon />
				</Button>
				<Button
					variant="secondary"
					aria-label="remove-mini-set-from-set-{idx + 1}-of-{exercise.name}"
					disabled={set.miniSets.length === 0}
					onclick={() => set.miniSets.pop()}
				>
					<RemoveIcon />
				</Button>
				<span></span>
				<span></span>
			{/if}
		{/each}
	</div>
{/if}
