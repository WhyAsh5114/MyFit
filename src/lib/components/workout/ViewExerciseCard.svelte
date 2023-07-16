<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale, slide } from 'svelte/transition';
	import ExerciseDetailsModal from './ExerciseDetailsModal.svelte';

	export let workoutExercises: WorkoutExercise[];
	let viewingExercise: WorkoutExercise;
</script>

<ExerciseDetailsModal bind:viewingExercise />
<ul class="flex flex-col gap-2">
	{#each workoutExercises as exercise (exercise.name)}
		<li
			class="flex flex-col bg-secondary w-full rounded-lg text-black p-3 h-fit"
			animate:flip={{ duration: 200 }}
			in:slide|local={{ duration: 200 }}
			out:scale|local={{ duration: 200 }}
		>
			<div class="flex justify-between">
				<h3 class="text-lg font-bold">{exercise.name}</h3>
				<div class="dropdown dropdown-end w-5">
					<button>
						<img src="/HamburgerMenu.svg" alt="menu" />
					</button>
					<ul
						class="menu gap-1 dropdown-content p-2 shadow-black bg-base-100 rounded-md shadow-md border border-primary z-10"
					>
						<button
							class="btn btn-sm"
							on:click={() => {
								viewingExercise = exercise;
							}}>Details</button
						>
					</ul>
				</div>
			</div>
			<div class="flex justify-between items-end -mt-2">
				<h4 class="capitalize text-sm font-semibold italic">{exercise.setType} sets</h4>
				<div class="flex justify-between mt-2.5 text-sm">
					<span class="badge badge-error text-black">{exercise.muscleTarget}</span>
				</div>
			</div>
			<div class="h-px w-full bg-black my-2" />
			<div
				class="grid grid-cols-4 place-items-center gap-y-2 gap-x-1 overflow-x-auto"
				id="workout-card-grid"
			>
				<p class="text-sm -mb-1">Reps</p>
				<p class="text-sm -mb-1">Load</p>
				<p class="text-sm -mb-1">RIR</p>
				{#each exercise.repsLoadRIR as repLoadRIR}
					<p class="px-4 py-1.5 font-semibold bg-black text-sm text-white">{repLoadRIR[0]}</p>
					<p class="px-4 py-1.5 font-semibold bg-black text-sm text-white">{repLoadRIR[1]} kg</p>
					<p class="px-4 py-1.5 font-semibold bg-black text-sm text-white">{repLoadRIR[2]} RIR</p>
				{/each}
			</div>
		</li>
	{/each}
</ul>

<style>
	#workout-card-grid {
		grid-template-columns: auto auto auto;
	}
</style>
