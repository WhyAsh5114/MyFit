<script lang="ts">
	import WorkoutExerciseSets from "./WorkoutExerciseSets.svelte";
	import Hamburger from "virtual:icons/material-symbols/menu";
	export let exercise: WorkoutExerciseWithoutSetNumbers;
	export let exerciseIndex: number;
	export let setsCompleted: boolean[];
	export let totalExercises: number;

	export let editExercise: (idx: number) => void;
	export let reorderExercise: (idx: number, direction: "up" | "down") => void;
	export let deleteExercise: (idx: number) => void;
	export let takeFeedback: (idx: number, force?: boolean) => void;

	function addSet() {
		exercise.sets = [...exercise.sets, { reps: null, load: null, RIR: null }];
		setsCompleted = [...setsCompleted, false];
	}
	function removeSet() {
		exercise.sets.pop();
		exercise.sets = exercise.sets;
		setsCompleted.pop();
		setsCompleted = setsCompleted;
	}

	$: if (!setsCompleted.includes(false)) {
		takeFeedback(exerciseIndex);
	}
</script>

<div class="flex flex-col rounded-md bg-primary p-2">
	<div class="flex gap-2 w-full">
		<span class="font-semibold grow">{exercise.name}</span>
		<div class="dropdown dropdown-end">
			<button class="btn p-0 btn-xs btn-ghost" aria-label="Exercise options"><Hamburger /></button>
			<ul
				class="shadow-2xl shadow-black menu menu-sm dropdown-content z-10 bg-neutral gap-1 rounded-md w-fit"
			>
				<li>
					<button
						class="btn btn-sm btn-primary rounded-sm"
						on:click={() => editExercise(exerciseIndex)}
					>
						Edit
					</button>
				</li>
				<li>
					<button
						class="btn btn-sm rounded-sm btn-primary"
						on:click={() => takeFeedback(exerciseIndex, true)}
						disabled={setsCompleted.includes(false)}
					>
						Feedback
					</button>
				</li>
				<li class="join grid grid-cols-2 gap-1">
					<button
						class="btn btn-sm join-item btn-primary rounded-sm"
						on:click={() => reorderExercise(exerciseIndex, "up")}
						disabled={exerciseIndex === 0}
					>
						↑
					</button>
					<button
						class="btn btn-sm join-item btn-primary rounded-sm"
						on:click={() => reorderExercise(exerciseIndex, "down")}
						disabled={exerciseIndex === totalExercises - 1}
					>
						↓
					</button>
				</li>
				<li class="join grid grid-cols-2 gap-1">
					<button class="btn btn-sm join-item btn-primary rounded-sm" on:click={addSet}> + </button>
					<button
						class="btn btn-sm join-item btn-primary rounded-sm"
						on:click={removeSet}
						disabled={setsCompleted.length === 1}
					>
						-
					</button>
				</li>
				<li>
					<button
						class="btn btn-sm btn-error rounded-sm"
						on:click={() => deleteExercise(exerciseIndex)}
					>
						Delete
					</button>
				</li>
			</ul>
		</div>
	</div>
	<div class="flex items-center justify-between text-sm">
		<p>{exercise.repRangeStart} to {exercise.repRangeEnd} reps</p>
		<span class="badge badge-error font-semibold">{exercise.targetMuscleGroup}</span>
	</div>
	{#if exercise.note}
		<p class="bg-info bg-opacity-75 text-black px-1 text-sm rounded-sm mt-1.5">{exercise.note}</p>
	{/if}
	<div class="h-px bg-secondary brightness-75 mt-1.5"></div>
	<div class="grid workout-sets-grid gap-x-2 gap-y-1 mt-2 place-items-center">
		<span class="text-sm font-semibold">Reps</span>
		<span class="text-sm font-semibold">
			Load
			{#if exercise.weightType === "Bodyweight"}
				<span class="text-white text-xs">BW</span>
			{/if}
		</span>
		<span class="text-sm font-semibold">RIR</span>
		<span></span>
		<WorkoutExerciseSets bind:exercise bind:setsCompleted />
	</div>
</div>

<style lang="postcss">
	.workout-sets-grid {
		grid-template-columns: 1fr 1fr 1fr 2.5rem;
	}
</style>
