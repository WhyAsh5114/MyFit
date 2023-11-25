<script lang="ts">
	import { goto } from "$app/navigation";
	import MyModal from "$lib/components/MyModal.svelte";
	import SplitExercisesTable from "$lib/components/mesocycles/SplitExercisesTable.svelte";
	import { exerciseSplit } from "../newMesocycleStore";

	type SplitWorkout = { name: string; exercises: SplitExercise[] };
	let copiedExercises: SplitExercise[] = [];

	let selectedWorkoutIndex = $exerciseSplit.findIndex((split) => split !== null);
	$: selectedWorkout = $exerciseSplit[selectedWorkoutIndex] as SplitWorkout;

	function copyExercises() {
		copiedExercises = JSON.parse(JSON.stringify(selectedWorkout.exercises)) as SplitExercise[];
	}
	function pasteExercises() {
		selectedWorkout.exercises = JSON.parse(JSON.stringify(copiedExercises)) as SplitExercise[];
	}
	function cutExercises() {
		copyExercises();
		selectedWorkout.exercises = [];
	}

	let invalidSplits: string[] = [];
	async function validateExercises() {
		invalidSplits = [];
		$exerciseSplit.forEach((split) => {
			if (split === null) return;
			if (split.exercises.length === 0) invalidSplits.push(split.name);
		});
		if (invalidSplits.length > 0) {
			errorModal.show();
			return;
		}
		await goto("/mesocycles/create/new/extras");
	}

	let errorModal: HTMLDialogElement;
</script>

<MyModal title="Error" bind:dialogElement={errorModal}>
	Add at least one exercise in each workout. Missing in: <span class="font-semibold text-error">
		{invalidSplits.join(", ")}
	</span>
</MyModal>
<div class="collapse collapse-arrow rounded-md bg-primary my-2">
	<input type="checkbox" id="show-all-days" aria-label="show-all-days" checked />
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
							class="join-item btn btn-sm btn-secondary checked:!text-black checked:!bg-accent"
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
{#key selectedWorkout.name}
	<SplitExercisesTable bind:exercises={selectedWorkout.exercises} />
{/key}
<div class="join grid grid-cols-3 gap-1 my-2">
	<button
		class="btn join-item btn-sm btn-secondary"
		disabled={selectedWorkout.exercises.length === 0}
		on:click={copyExercises}
	>
		Copy
	</button>
	<button
		class="btn join-item btn-sm btn-secondary"
		disabled={copiedExercises.length === 0 || selectedWorkout.exercises.length > 0}
		on:click={pasteExercises}
	>
		Paste
	</button>
	<button
		class="btn join-item btn-sm btn-error"
		disabled={selectedWorkout.exercises.length === 0}
		on:click={cutExercises}
	>
		Cut
	</button>
</div>
<div class="join grid grid-cols-2">
	<a class="btn btn-primary join-item" href="/mesocycles/create/new/split">Previous</a>
	<button class="btn btn-accent join-item" on:click={validateExercises}>Next</button>
</div>
