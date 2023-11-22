<script lang="ts">
	import Hamburger from "virtual:icons/material-symbols/menu";
	import DoneIcon from "virtual:icons/material-symbols/done";
	import { range } from "$lib/util/CommonFunctions";
	export let exercise: WorkoutExerciseWithoutSetNumbers;

	function selectParam(
		value: number,
		setNumber: number,
		currentTarget: EventTarget & HTMLButtonElement,
		param: "reps" | "load" | "RIR"
	) {
        currentTarget.blur();
        
		if (param === "reps") exercise.sets[setNumber].reps = value;
		if (param === "load") exercise.sets[setNumber].load = value;
		if (param === "RIR") exercise.sets[setNumber].RIR = value;
	}

	const repsArray = "";
</script>

<div class="flex flex-col rounded-md bg-primary p-2">
	<div class="flex gap-2 w-full">
		<span class="font-semibold grow">{exercise.name}</span>
		<div class="dropdown dropdown-end">
			<button class="btn p-0 btn-xs btn-ghost" aria-label="Exercise options"><Hamburger /></button>
			<ul class="dropdown-menu">
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
	<div class="grid workout-sets-grid gap-x-2 gap-y-1 mt-2 place-items-center">
		<span class="text-sm font-semibold">Reps</span>
		<span class="text-sm font-semibold">Load</span>
		<span class="text-sm font-semibold">RIR</span>
		<span></span>
		{#each exercise.sets as { reps, load, RIR }, setNumber}
			<div class="dropdown">
				<button class="btn py-0 btn-sm rounded-md">
					{#if reps !== null}
						{reps}
					{:else}
						?
					{/if}
				</button>
				<div class="dropdown-menu mt-0.5 h-44 overflow-y-auto flex flex-col !flex-nowrap">
					{#each range(1, 100, 1) as i}
						<button
							class="btn btn-sm"
							on:click={(e) => {
								selectParam(i, setNumber, e.currentTarget, "reps");
							}}
						>
							{i}
						</button>
					{/each}
				</div>
			</div>
			<div class="dropdown">
				<button class="btn py-0 btn-sm rounded-md">
					{#if load !== null}
						{load}
					{:else}
						?
					{/if}
				</button>
				<ul class="dropdown-menu mt-0.5 h-44 overflow-y-auto flex flex-col !flex-nowrap">
					{#each range(0, 1000, 2.5) as i}
						<li>
							<button
								class="btn btn-sm"
								on:click={(e) => selectParam(i, setNumber, e.currentTarget, "load")}
							>
								{i}
							</button>
						</li>
					{/each}
				</ul>
			</div>
			<div class="dropdown">
				<button class="btn py-0 btn-sm rounded-md">
					{#if RIR !== null}
						{RIR}
					{:else}
						?
					{/if}
				</button>
				<ul class="dropdown-menu mt-0.5 h-fit overflow-y-auto flex flex-col !flex-nowrap">
					{#each range(4, 0, -1) as x, i}
						<li>
							<button
								class="btn btn-sm"
								on:click={(e) => selectParam(i, setNumber, e.currentTarget, "RIR")}
							>
								{i}
							</button>
						</li>
					{/each}
				</ul>
			</div>
			<button class="btn btn-xs btn-accent btn-circle" aria-label="mark-set-complete">
				<DoneIcon />
			</button>
		{/each}
	</div>
</div>

<style lang="postcss">
	.workout-sets-grid {
		grid-template-columns: 1fr 1fr 1fr 2.5rem;
	}
</style>
