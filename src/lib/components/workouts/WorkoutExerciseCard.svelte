<script lang="ts">
	import Hamburger from "virtual:icons/material-symbols/menu";
	import DoneIcon from "virtual:icons/material-symbols/done";
	export let exercise: WorkoutExerciseWithoutSetNumbers;
</script>

<div class="flex flex-col rounded-md bg-primary p-2">
	<div class="flex gap-2 w-full">
		<span class="font-semibold grow">{exercise.name}</span>
		<div class="dropdown dropdown-end">
			<button class="btn p-0 btn-xs btn-ghost" aria-label="Exercise options"><Hamburger /></button>
			<ul class="shadow menu menu-sm dropdown-content z-10 bg-neutral gap-1 rounded-md w-fit">
				<li><button class="btn btn-sm">Func1</button></li>
				<li><button class="btn btn-sm">Func2</button></li>
				<li><button class="btn btn-sm">Func3</button></li>
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
	<div class="grid workout-sets-grid gap-x-2 mt-2 place-items-center">
		<span class="text-sm font-semibold">Reps</span>
        <span class="text-sm font-semibold">Load</span>
        <span class="text-sm font-semibold">RIR</span>
        <span></span>
		{#each exercise.sets as { reps, load, RIR }}
			<select id="reps" class="select select-sm" aria-label="exercise-reps">
				<option value={reps}>{reps}</option>
			</select>
			<select id="load" class="select select-sm" aria-label="exercise-load">
				<option value={load}>{load}</option>
			</select>
			<select id="RIR" class="select select-sm" aria-label="exercise-RIR">
				<option value={RIR}>{RIR}</option>
			</select>
            <button class="btn btn-xs btn-accent btn-circle" aria-label="mark-set-complete">
                <DoneIcon />
            </button>
		{/each}
	</div>
</div>

<style>
    .workout-sets-grid {
        grid-template-columns: 1fr 1fr 1fr 3rem;
    }
</style>
