<script lang="ts">
	import { muscleGroups } from "$lib/commonDB";
	import MyModal from "../MyModal.svelte";
	export let dialogElement: HTMLDialogElement;
	export let exercises: SplitExercise[];
	export let exerciseOriginalName: string | undefined;

	let exerciseNameInput: HTMLInputElement;
	let currentExercise: Partial<SplitExercise> = {};
	$: if (exerciseOriginalName) {
		currentExercise = exercises.find(
			(exercise) => exercise.name === exerciseOriginalName
		) || {};
	}

	let alreadyExists = false;
	function validateExercise() {
		alreadyExists = false;
		exercises.forEach((exercise) => {
			if (exercise.name === currentExercise.name || exercise.name === exerciseOriginalName) {
				alreadyExists = true;
			}
		});
		if (alreadyExists) {
			exerciseNameInput.focus();
			return false;
		}

		const typedExercise = JSON.parse(JSON.stringify(currentExercise)) as SplitExercise;
		const originalIdx = exercises.findIndex((exercise) => exercise.name === exerciseOriginalName);
		exercises[originalIdx] = typedExercise;
		exercises = exercises;
		dialogElement.close();
		currentExercise = {};
	}
</script>

<MyModal title="Edit exercise" titleColor="text-accent" bind:dialogElement>
	<form on:submit|preventDefault={validateExercise}>
		<div class="form-control w-full">
			<label class="label" for="edit-exercise-name">
				<span class="label-text">Exercise name</span>
				{#if alreadyExists}
					<span class="label-text-alt text-error">Already exists, use a different name</span>
				{/if}
			</label>
			<input
				type="text"
				placeholder="Type here"
				class="input input-bordered w-full"
				id="edit-exercise-name"
				bind:this={exerciseNameInput}
				bind:value={currentExercise.name}
				required
			/>
		</div>
		<div class="flex gap-2">
			<div class="form-control w-full">
				<label class="label" for="edit-exercise-sets">
					<span class="label-text">Sets</span>
				</label>
				<input
					type="number"
					min="1"
					placeholder="Type here"
					class="input input-bordered w-full max-w-xs"
					id="edit-exercise-sets"
					bind:value={currentExercise.sets}
					required
				/>
			</div>
			<div class="form-control w-full max-w-xs">
				<label class="label" for="edit-exercise-muscle-group">
					<span class="label-text">Target muscle group</span>
				</label>
				<select
					class="select select-bordered"
					id="edit-exercise-muscle-group"
					bind:value={currentExercise.targetMuscleGroup}
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
			<div class="form-control w-full max-w-xs">
				<label class="label" for="edit-exercise-rep-range-start">
					<span class="label-text">Rep range start</span>
				</label>
				<input
					placeholder="Type here"
					class="input input-bordered w-full max-w-xs"
					id="edit-exercise-rep-range-start"
					type="number"
					min="1"
					bind:value={currentExercise.repRangeStart}
					required
				/>
			</div>
			<div class="form-control w-full max-w-xs">
				<label class="label" for="edit-exercise-rep-range-end">
					<span class="label-text">Rep range end</span>
				</label>
				<input
					placeholder="Type here"
					class="input input-bordered w-full max-w-xs"
					id="edit-exercise-rep-range-end"
					min={(currentExercise.repRangeStart || 0) + 1}
					type="number"
					bind:value={currentExercise.repRangeEnd}
					required
				/>
			</div>
		</div>
		<div class="form-control">
			<label class="label" for="edit-exercise-note">
				<span class="label-text">Exercise note</span>
			</label>
			<textarea
				class="textarea textarea-bordered h-24 resize-none"
				placeholder="Note"
				id="edit-exercise-note"
				bind:value={currentExercise.note}
			></textarea>
		</div>
		<button class="btn btn-block btn-accent mt-4">Edit exercise</button>
	</form>
</MyModal>
