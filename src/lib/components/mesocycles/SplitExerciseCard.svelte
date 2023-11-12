<script lang="ts">
	import Hamburger from "$lib/Hamburger.svelte";

	export let exercise: SplitExercise;
</script>

<div class="flex flex-col bg-primary w-full h-fit rounded-md p-2">
	<div class="flex gap-2">
		<p class="font-semibold grow">{exercise.name}</p>
		<details class="dropdown dropdown-end">
			<summary class="btn p-0 btn-xs btn-ghost"><Hamburger /></summary>
			<ul class="shadow menu menu-sm uppercase font-semibold dropdown-content z-[1] bg-secondary rounded-md w-fit">
				<li><button class="text-black uppercase">Edit</button></li>
				<li><button class="text-error uppercase">Delete</button></li>
			</ul>
		</details>
	</div>
	<div class="flex items-end justify-between text-sm">
		<p>{exercise.sets} sets of {exercise.repRangeStart} to {exercise.repRangeEnd} reps</p>
		<span class="badge badge-error text-black font-semibold">{exercise.targetMuscleGroup}</span>
	</div>
	{#if exercise.note}
		<p class="bg-info bg-opacity-75 text-black px-1 text-sm rounded-sm mt-1.5">{exercise.note}</p>
	{/if}
</div>
