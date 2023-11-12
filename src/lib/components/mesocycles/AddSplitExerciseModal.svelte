<script lang="ts">
	import { muscleGroups } from "$lib/commonDB";
	import MyModal from "../MyModal.svelte";
	export let dialogElement: HTMLDialogElement;
	export let exercises: SplitExercise[];

	const newExercise: Partial<SplitExercise> = {};
	function validateExercise() {
		let alreadyExists = false;
		exercises.forEach((exercise) => {
			if (exercise.name === newExercise.name) alreadyExists = true;
		});
        if (alreadyExists) return false;

        const typedExercise = newExercise as SplitExercise;
        exercises.push(typedExercise);
        exercises = exercises;
		dialogElement.close();
	}
</script>

<MyModal title="Add exercise" titleColor="text-accent" bind:dialogElement>
	<form on:submit|preventDefault={validateExercise}>
		<div class="form-control w-full">
			<label class="label" for="new-exercise-name">
				<span class="label-text">Exercise name</span>
			</label>
			<input
				type="text"
				placeholder="Type here"
				class="input input-bordered w-full"
				id="new-exercise-name"
				bind:value={newExercise.name}
				required
			/>
		</div>
		<div class="flex gap-2">
			<div class="form-control w-full">
				<label class="label" for="new-exercise-sets">
					<span class="label-text">Sets</span>
				</label>
				<input
					type="number"
					min="1"
					placeholder="Type here"
					class="input input-bordered w-full max-w-xs"
					id="new-exercise-sets"
					bind:value={newExercise.sets}
					required
				/>
			</div>
			<div class="form-control w-full max-w-xs">
				<label class="label" for="new-exercise-muscle-group">
					<span class="label-text">Target muscle group</span>
				</label>
				<select
					class="select select-bordered"
					id="new-exercise-muscle-group"
					bind:value={newExercise.targetMuscleGroup}
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
				<label class="label" for="new-exercise-rep-range-start">
					<span class="label-text">Rep range start</span>
				</label>
				<input
					placeholder="Type here"
					class="input input-bordered w-full max-w-xs"
					id="new-exercise-rep-range-start"
					type="number"
					min="1"
					bind:value={newExercise.repRangeStart}
					required
				/>
			</div>
			<div class="form-control w-full max-w-xs">
				<label class="label" for="new-exercise-rep-range-end">
					<span class="label-text">Rep range end</span>
				</label>
				<input
					placeholder="Type here"
					class="input input-bordered w-full max-w-xs"
					id="new-exercise-rep-range-end"
					min={(newExercise.repRangeStart || 0) + 1}
					type="number"
					bind:value={newExercise.repRangeEnd}
					required
				/>
			</div>
		</div>
		<div class="form-control">
			<label class="label" for="new-exercise-note">
				<span class="label-text">Exercise note</span>
			</label>
			<textarea
				class="textarea textarea-bordered h-24 resize-none"
				placeholder="Note"
				id="new-exercise-note"
				bind:value={newExercise.note}
			></textarea>
		</div>
		<button class="btn btn-block btn-accent mt-4">Add exercise</button>
	</form>
</MyModal>
