<script lang="ts">
	import { exerciseWeightTypes, muscleGroups } from "$lib/types/arrays";
	import MyModal from "../MyModal.svelte";
	export let dialogElement: HTMLDialogElement;
	export let exercises: SplitExercise[];
	export let editingIdx: number | undefined = undefined;

	let editMode = false;
	let modeText: "Add" | "Edit" = "Add";
	let selectedExercise: Partial<SplitExercise>;

	let editingExercise: Partial<SplitExercise> = {};
	$: exercises, updateEditingExercise(editingIdx);
	function updateEditingExercise(idx: number | undefined) {
		if (idx !== undefined && exercises[idx]) {
			editMode = true;
			editingExercise = JSON.parse(JSON.stringify(exercises[idx]));
		} else {
			editMode = false;
		}
	}

	let newExercise: Partial<SplitExercise> = {};
	let alreadyExists = false;
	function addExercise() {
		const duplicate = exercises.find((exercise) => exercise.name === newExercise.name);
		alreadyExists = duplicate ? true : false;
		if (duplicate) return false;

		const typedExercise = JSON.parse(JSON.stringify(newExercise)) as SplitExercise;
		exercises = [...exercises, typedExercise];
		newExercise = {};
		selectedExercise = newExercise;
		dialogElement.close();
	}

	function editExercise(idx: number) {
		const duplicate = exercises.find((exercise, exerciseIdx) => {
			return exercise.name === editingExercise.name && exerciseIdx !== idx;
		});
		alreadyExists = duplicate ? true : false;
		if (duplicate) return false;

		const typedExercise = editingExercise as SplitExercise;
		if (idx === undefined) return;
		exercises[idx] = typedExercise;
		exercises = exercises;
		dialogElement.close();
	}

	function submitForm() {
		if (editingIdx !== undefined) return editExercise(editingIdx);
		else return addExercise();
	}

	$: editMode, editingIdx && exercises[editingIdx], updateMode();
	function updateMode() {
		if (editMode) {
			modeText = "Edit";
			selectedExercise = editingExercise;
		} else {
			modeText = "Add";
			selectedExercise = newExercise;
		}
	}
</script>

<MyModal title="{modeText} exercise" titleColor="text-accent" bind:dialogElement>
	<form on:submit|preventDefault={submitForm}>
		<div class="form-control w-full">
			<label class="label" for="{modeText}-exercise-name">
				<span class="label-text">Exercise name</span>
				{#if alreadyExists}
					<span class="label-text-alt text-error">Already exists, use a different name</span>
				{/if}
			</label>
			<input
				type="text"
				placeholder="Type here"
				class="input input-bordered w-full"
				id="{modeText}-exercise-name"
				bind:value={selectedExercise.name}
				required
			/>
		</div>
		<div class="flex gap-2">
			<div class="form-control w-full max-w-xs">
				<label class="label" for="{modeText}-exercise-weight-type">
					<span class="label-text">Weight type</span>
				</label>
				<select
					class="select select-bordered"
					id="{modeText}-exercise-weight-type"
					bind:value={selectedExercise.weightType}
					required
				>
					<option value={undefined} disabled selected>Pick one</option>
					{#each exerciseWeightTypes as weightType}
						<option>{weightType}</option>
					{/each}
				</select>
			</div>
			<div class="form-control w-full max-w-xs">
				<label class="label" for="{modeText}-exercise-muscle-group">
					<span class="label-text">Target muscle</span>
				</label>
				<select
					class="select select-bordered"
					id="{modeText}-exercise-muscle-group"
					bind:value={selectedExercise.targetMuscleGroup}
					required
				>
					<option value={undefined} disabled selected>Pick one</option>
					{#each muscleGroups as muscleGroup}
						<option>{muscleGroup}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="flex gap-2">
			<div class="form-control w-full">
				<label class="label" for="{modeText}-exercise-sets">
					<span class="label-text">Sets</span>
				</label>
				<input
					type="number"
					min="1"
					placeholder="Type here"
					class="input input-bordered w-full max-w-xs"
					id="{modeText}-exercise-sets"
					bind:value={selectedExercise.sets}
					required
				/>
			</div>
			<div class="grid grid-cols-2 justify-items-center items-end gap-x-0.5">
				<span class="label-text col-span-2">Rep range</span>
				<input
					placeholder="From"
					class="input input-bordered w-full max-w-xs"
					id="{modeText}-exercise-rep-range-start"
					type="number"
					min="1"
					bind:value={selectedExercise.repRangeStart}
					required
				/>
				<input
					placeholder="To"
					class="input input-bordered w-full max-w-xs"
					id="{modeText}-exercise-rep-range-end"
					min={(selectedExercise.repRangeStart || 0) + 1}
					type="number"
					bind:value={selectedExercise.repRangeEnd}
					required
				/>
			</div>
		</div>
		<div class="form-control">
			<label class="label" for="{modeText}-exercise-note">
				<span class="label-text">Exercise note</span>
			</label>
			<textarea
				class="textarea textarea-bordered h-24 resize-none"
				placeholder="Note"
				id="{modeText}-exercise-note"
				bind:value={selectedExercise.note}
			></textarea>
		</div>
		<button class="btn btn-block btn-accent mt-4">{modeText} exercise</button>
	</form>
</MyModal>
