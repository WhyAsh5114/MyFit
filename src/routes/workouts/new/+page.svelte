<script lang="ts">
	import { goto, invalidate } from "$app/navigation";
	import MyModal from "$lib/components/MyModal.svelte";
	import { dateFormatter } from "$lib/util/CommonFunctions.js";
	import {
		getCycleNumber,
		getDayNumber,
		getMuscleGroupsAndSets,
		getPlannedRIR,
		getTodaysSplitWorkout,
		getTotalSets
	} from "$lib/util/MesocycleTemplate.js";
	import EditIcon from "virtual:icons/ep/edit";
	import DoneIcon from "virtual:icons/material-symbols/done";
	import CancelIcon from "virtual:icons/ph/x-bold";

	let modal: HTMLDialogElement;
	let modalTitle = "";
	let modalText = "";
	let modalClose = () => {};

	export let data;
	const { activeMesocycle, activeMesocycleTemplate } = data;
	const workoutIdx = getDayNumber(activeMesocycle.workouts, activeMesocycleTemplate.exerciseSplit);
	const todaysWorkout = getTodaysSplitWorkout(
		activeMesocycle.workouts,
		activeMesocycleTemplate.exerciseSplit
	);
	let muscleGroupsAndSets: { muscleGroup: MuscleGroup; sets: number }[];
	let totalSets = 0;
	let bodyweightExercises = false;
	if (todaysWorkout) {
		muscleGroupsAndSets = getMuscleGroupsAndSets(todaysWorkout.exercises);
		totalSets = getTotalSets(todaysWorkout.exercises);
		for (const exercise of todaysWorkout.exercises) {
			if (exercise.weightType.includes("Bodyweight")) {
				bodyweightExercises = true;
				break;
			}
		}
	}

	let bodyweightInputValue = data.userBodyweight;
	let editingBodyweightValue = bodyweightInputValue === null;
	async function submitForm() {
		if (todaysWorkout) {
			await goto("/workouts/new/exercises");
			return;
		}
		callingEndpoint = true;
		const response = await fetch("/api/workouts/completeRestDay", {
			method: "POST"
		});
		if (response.ok) {
			modalTitle = "Success";
		} else {
			modalTitle = "Error";
		}
		modalText = await response.text();
		callingEndpoint = false;
		modalClose = closeModalWithRedirect;
		modal.show();
	}

	let redirecting = false;
	async function closeModalWithRedirect() {
		redirecting = true;
		await invalidate("mesocycle:active");
		await goto("/workouts");
		redirecting = false;
	}

	let callingEndpoint = false;
	async function saveBodyweight() {
		const requestBody: APIUserUpdatePreferences = {
			bodyweight: bodyweightInputValue
		};
		callingEndpoint = true;
		const response = await fetch("/api/user/updatePreferences", {
			method: "POST",
			body: JSON.stringify(requestBody),
			headers: {
				"content-type": "application/json"
			}
		});
		await invalidate("user:preferences");
		callingEndpoint = false;
		if (response.ok) {
			editingBodyweightValue = false;
		} else {
			modalTitle = "Error";
			modalText = await response.text();
			modalClose = () => {};
			modal.show();
		}
	}
</script>

<MyModal bind:dialogElement={modal} bind:title={modalTitle} bind:onClose={modalClose}>
	{modalText}
</MyModal>
<form
	on:submit|preventDefault={submitForm}
	id="workoutForm"
	class="stats stats-vertical grid grid-cols-2"
>
	{#if todaysWorkout}
		<div class="stat col-span-2">
			<div class="stat-title">Workout template</div>
			<div class="stat-value">
				{todaysWorkout.name}
			</div>
			<div class="stat-desc">
				Day {workoutIdx + 1}, Cycle {getCycleNumber(
					activeMesocycleTemplate.exerciseSplit,
					activeMesocycle.workouts
				)}
			</div>
		</div>
		<div class="stat">
			<div class="stat-title">Total sets</div>
			<div class="stat-value">{totalSets}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Planned RIR</div>
			<div class="stat-value">
				{getPlannedRIR(activeMesocycleTemplate, activeMesocycle.workouts)}
			</div>
		</div>
		<div class="stat col-span-2">
			<div class="stat-title">Muscle groups</div>
			<div class="flex flex-wrap gap-1 mt-2 font-semibold">
				{#each muscleGroupsAndSets as { muscleGroup, sets }}
					{@const specialized = activeMesocycleTemplate.specialization?.includes(muscleGroup)}
					<span class="badge {specialized ? 'badge-accent' : ''}">{muscleGroup} x {sets}</span>
				{/each}
			</div>
		</div>
		<div class="stat col-span-2">
			<div class="stat-title">Reference workout</div>
			<div class="stat-value">
				{#if data.referenceWorkout}
					{dateFormatter(data.referenceWorkout.startTimestamp)}
				{:else}
					Not found
				{/if}
			</div>
		</div>
		{#if bodyweightExercises}
			<div class="stat col-span-2 w-full">
				<div class="stat-title mb-2">Bodyweight</div>
				<div class="flex justify-between items-center gap-2">
					{#if data.userBodyweight === null || editingBodyweightValue}
						<input
							type="number"
							id="bodyweight"
							min={0}
							step={0.01}
							class="input w-3/4"
							placeholder="Type here"
							bind:value={bodyweightInputValue}
							required
						/>
						<button
							class="btn btn-circle btn-sm btn-error shrink-0"
							type="button"
							on:click={() => (editingBodyweightValue = false)}
							disabled={data.userBodyweight === null}
							aria-label="cancel-editing-bodyweight"
						>
							<CancelIcon class="w-5 h-5" />
						</button>
						<button
							class="btn btn-circle btn-sm btn-accent shrink-0"
							type="button"
							on:click={saveBodyweight}
							disabled={bodyweightInputValue === null}
							aria-label="set-bodyweight"
						>
							{#if callingEndpoint}
								<span class="loading loading-spinner"></span>
							{:else}
								<DoneIcon class="w-6 h-6" />
							{/if}
						</button>
					{:else}
						<div class="stat-value">{data.userBodyweight}</div>
						<button
							class="btn btn-sm btn-ghost"
							type="button"
							on:click={() => {
								bodyweightInputValue = data.userBodyweight;
								editingBodyweightValue = true;
							}}
						>
							<EditIcon class="w-6 h-6" />
						</button>
					{/if}
				</div>
			</div>
		{/if}
	{:else}
		<div class="stat">
			<div class="stat-title">Workout template</div>
			<div class="stat-value">It's a Rest day!</div>
		</div>
	{/if}
</form>

<button
	type="submit"
	form="workoutForm"
	class="btn btn-accent mt-auto"
	disabled={editingBodyweightValue || callingEndpoint || redirecting}
>
	{#if todaysWorkout}
		Log workout
	{:else if callingEndpoint}
		<span class="loading loading-bars"></span>
	{:else if redirecting}
		Redirecting
		<span class="loading loading-bars"></span>
	{:else}
		Mark rest day complete
	{/if}
</button>
