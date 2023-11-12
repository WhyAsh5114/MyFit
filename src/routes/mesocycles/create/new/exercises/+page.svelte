<script lang="ts">
	import SplitExercisesTable from "$lib/components/mesocycles/SplitExercisesTable.svelte";
	import { exerciseSplit } from "../newMesocycleStore";

	let selectedWorkoutIndex = $exerciseSplit.findIndex((split) => split !== null);
	$: selectedWorkout = $exerciseSplit[selectedWorkoutIndex] as {
		name: string;
		exercises: SplitExercise[];
	};
</script>

<div class="collapse collapse-arrow rounded-md bg-primary my-2">
	<input type="checkbox" id="show-all-days" aria-label="show-all-days" />
	<div class="collapse-title text-xl font-semibold">
		D{selectedWorkoutIndex + 1}
		<span class="text-base font-normal ml-2">{$exerciseSplit[selectedWorkoutIndex]?.name}</span>
	</div>
	<div class="collapse-content backdrop-brightness-50">
		<div class="flex flex-wrap justify-center items-center gap-2 mt-4">
			{#each $exerciseSplit as splitDay, i}
				<div class="join">
					<span class="join-item btn btn-sm">D{i + 1}</span>
					{#if splitDay === null}
						<input
							class="join-item btn btn-sm"
							type="radio"
							name="options"
							aria-label="Rest"
							disabled
						/>
					{:else}
						<input
							class="join-item btn btn-sm btn-secondary checked:!btn-accent"
							type="radio"
							name="options"
							aria-label={splitDay.name}
							value={i}
							bind:group={selectedWorkoutIndex}
						/>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
<SplitExercisesTable bind:exercises={selectedWorkout.exercises} />
<div class="join grid grid-cols-2">
	<a class="btn btn-primary join-item" href="/mesocycles/create/new/split">Previous</a>
	<button class="btn btn-accent join-item">Next</button>
</div>
