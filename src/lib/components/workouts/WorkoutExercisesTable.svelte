<script lang="ts">
	import WorkoutExerciseCard from "./WorkoutExerciseCard.svelte";

	export let exercises: WorkoutExerciseWithoutSetNumbers[];
</script>

<div class="flex flex-col h-px grow overflow-y-auto mt-2 gap-1">
	{#each exercises as exercise}
		<WorkoutExerciseCard {exercise} />
	{/each}
</div>
<button class="btn btn-primary mt-1">Add exercise</button>
