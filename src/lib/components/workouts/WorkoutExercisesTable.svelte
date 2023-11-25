<script lang="ts">
	import WorkoutExerciseCard from "./WorkoutExerciseCard.svelte";
	export let exercises: WorkoutExerciseWithoutSetNumbers[];
	export let mode: "performing" | "performed" = "performing";

	export let allExercisesSetsCompleted: boolean[][] = [];
	exercises.forEach((exercise) => {
		let setCompleted = mode === "performed";
		allExercisesSetsCompleted.push(Array(exercise.sets.length).fill(setCompleted));
	});
</script>

<div class="flex flex-col h-px grow overflow-y-auto mt-2 gap-1">
	{#each exercises as exercise, i}
		<WorkoutExerciseCard bind:exercise bind:setsCompleted={allExercisesSetsCompleted[i]} />
	{/each}
</div>
<button class="btn btn-primary mt-1">Add exercise</button>
