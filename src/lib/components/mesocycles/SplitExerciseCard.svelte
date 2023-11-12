<script lang="ts">
	import Hamburger from "$lib/Hamburger.svelte";

	export let exercise: SplitExercise;
</script>

<div class="flex flex-col bg-primary w-full h-fit rounded-md p-2">
	<div class="flex gap-2">
		<p class="font-semibold grow">{exercise.name}</p>
		<div class="dropdown dropdown-end">
			<button class="btn p-0 btn-xs btn-ghost"><Hamburger /></button>
			<ul class="shadow menu menu-sm dropdown-content z-[1] bg-neutral gap-1 rounded-md w-fit">
				<li><button class="btn btn-primary btn-sm rounded-sm">Edit</button></li>
				<li class="join grid grid-cols-2 gap-1">
					<button class="join-item text-lg btn btn-primary btn-sm p-0 rounded-sm">↑</button>
					<button class="join-item text-lg btn btn-primary btn-sm p-0 rounded-sm">↓</button>
				</li>
				<li><button class="btn btn-sm btn-error text-black rounded-sm">Delete</button></li>
			</ul>
		</div>
	</div>
	<div class="flex items-end justify-between text-sm">
		<p>{exercise.sets} sets of {exercise.repRangeStart} to {exercise.repRangeEnd} reps</p>
		<span class="badge badge-error text-black font-semibold">{exercise.targetMuscleGroup}</span>
	</div>
	{#if exercise.note}
		<p class="bg-info bg-opacity-75 text-black px-1 text-sm rounded-sm mt-1.5">{exercise.note}</p>
	{/if}
</div>
