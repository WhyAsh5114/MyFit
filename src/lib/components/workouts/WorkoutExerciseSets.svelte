<script lang="ts">
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

	function weightString(weightType: ExerciseWeightType, value: number) {
		if (weightType === "Weighted") return value.toString();
		if (weightType === "Bodyweight") {
			if (value > 0) {
				return `BW+${value}`;
			} else if (value < 0) {
				return `BW${value}`;
			} else {
				return "BW";
			}
		}
	}
</script>

{#each exercise.sets as { reps, load, RIR }, setNumber}
	<div class="dropdown">
		<button class="btn py-0 btn-sm rounded-md">
			{#if reps !== null}
				{reps}
			{:else}
				?
			{/if}
		</button>
		<div class="dropdown-menu weight-picker-menu h-44 !flex-nowrap">
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
		<ul class="dropdown-menu weight-picker-menu h-44 !flex-nowrap !w-28">
			{#each exercise.weightType === "Weighted" ? range(0, 1000, 2.5) : range(-100, 100, 2.5) as i}
				<li>
					<button
						class="btn btn-sm"
						on:click={(e) => selectParam(i, setNumber, e.currentTarget, "load")}
					>
						{weightString(exercise.weightType, i)}
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
		<ul class="dropdown-menu weight-picker-menu h-fit !flex-nowrap">
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

<style lang="postcss">
	.weight-picker-menu {
		@apply mt-0.5 overflow-y-auto flex flex-col;
	}
</style>
