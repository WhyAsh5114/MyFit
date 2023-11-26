<script lang="ts">
	import WorkoutCard from "./WorkoutCard.svelte";

	export let data;
</script>

<div class="flex flex-col h-px grow overflow-y-auto gap-1">
	{#each data.streamed.workoutsStreamArray as workoutPromise}
		<WorkoutCard {workoutPromise} />
	{/each}
</div>
<a href="/workouts/new" class="btn btn-accent btn-block">Log today's workout</a>
