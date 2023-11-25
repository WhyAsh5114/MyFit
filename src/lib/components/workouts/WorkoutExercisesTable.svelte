<script lang="ts">
	import { flip } from "svelte/animate";
	import { slide } from "svelte/transition";
	import AddEditWorkoutExerciseModal from "./AddEditWorkoutExerciseModal.svelte";
	import WorkoutExerciseCard from "./WorkoutExerciseCard.svelte";
	export let exercises: WorkoutExerciseWithoutSetNumbers[];
	export let mode: "performing" | "performed" = "performing";

	export let allExercisesSetsCompleted: boolean[][] = [];

	$: updateSetsCompleted(exercises);
	function updateSetsCompleted(exercises: WorkoutExerciseWithoutSetNumbers[]) {
		allExercisesSetsCompleted = [];
		exercises.forEach((exercise) => {
			let setCompleted = mode === "performed";
			allExercisesSetsCompleted.push(Array(exercise.sets.length).fill(setCompleted));
		});
	}

	let addEditWorkoutExerciseModal: HTMLDialogElement;
	let editingExerciseNumber: number | undefined = undefined;

	function addExercise() {
		editingExerciseNumber = undefined;
		addEditWorkoutExerciseModal.show();
	}

	function editExercise(idx: number) {
		editingExerciseNumber = idx;
		addEditWorkoutExerciseModal.show();
	}

	function deleteExercise(idx: number) {
		exercises.splice(idx, 1);
		exercises = exercises;
	}

	function reorderExercise(idx: number, direction: "up" | "down") {
		if (direction == "up") {
			[exercises[idx], exercises[idx - 1]] = [exercises[idx - 1], exercises[idx]];
		} else {
			[exercises[idx], exercises[idx + 1]] = [exercises[idx + 1], exercises[idx]];
		}
	}
</script>

<AddEditWorkoutExerciseModal
	bind:dialogElement={addEditWorkoutExerciseModal}
	bind:exercises
	bind:editingIdx={editingExerciseNumber}
/>
<div class="flex flex-col h-px grow overflow-y-auto mt-2 gap-1">
	{#each exercises as exercise, i (exercise.name)}
		<div transition:slide|local={{ duration: 200 }} animate:flip={{ duration: 200 }}>
			<WorkoutExerciseCard
				bind:exercise
				bind:setsCompleted={allExercisesSetsCompleted[i]}
				exerciseIndex={i}
				totalExercises={exercises.length}
				{editExercise}
				{deleteExercise}
				{reorderExercise}
			/>
		</div>
	{/each}
</div>
<button class="btn btn-primary mt-1" on:click={addExercise}>Add exercise</button>
