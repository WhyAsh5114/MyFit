<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale, slide } from 'svelte/transition';

	export let workoutExercises: WorkoutExercise[];
</script>

{#each workoutExercises as exercise, i (exercise.name)}
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
						
					</li>
				</ul>
			</div>
		</div>
		<h6 class="capitalize text-sm font-semibold italic">{exercise.setType} sets</h6>
		<div class="flex justify-between mt-2.5 text-sm">
			<span class="badge badge-error text-white">{exercise.muscleTarget}</span>
		</div>
	</li>
{/each}
