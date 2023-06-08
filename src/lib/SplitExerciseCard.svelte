<script lang="ts">
	import type { SplitExercise } from '$lib/global';
	import { flip } from 'svelte/animate';
	import { scale, slide } from 'svelte/transition';

	export let splitExercises: SplitExercise[];
	export let editExercise: (i: number, exercise: SplitExercise) => void;
	export let deleteExercise: (i: number) => void;
</script>

{#each splitExercises as exercise, i (exercise.name)}
	<li
		class="flex flex-col bg-secondary w-full rounded-lg text-black p-3 h-fit"
		animate:flip={{ duration: 200 }}
		in:slide|local={{ duration: 200 }}
		out:scale|local={{ duration: 200 }}
	>
		<div class="flex justify-between">
			<h5 class="text-lg font-bold">{exercise.name}</h5>
			<div class="dropdown dropdown-end w-5">
				<button>
					<img src="/HamburgerMenu.svg" alt="menu" />
				</button>
				<ul class="menu dropdown-content p-2 shadow-black bg-base-100 rounded-md shadow-md">
					<li>
						<button
							class="text-white uppercase font-semibold"
							on:click={() => {
								editExercise(i, exercise);
							}}>Edit</button
						>
					</li>
					<li>
						<button
							class="text-error uppercase font-semibold"
							on:click={() => {
								deleteExercise(i);
							}}>Delete</button
						>
					</li>
				</ul>
			</div>
		</div>
		<h6 class="capitalize text-sm font-semibold italic">{exercise.setType} sets</h6>
		<div class="flex justify-between mt-2.5 text-sm">
			<p>{exercise.sets} sets of {exercise.repRangeStart} to {exercise.repRangeEnd} reps</p>
			<span class="badge badge-error text-white">{exercise.muscleTarget}</span>
		</div>
	</li>
{/each}
