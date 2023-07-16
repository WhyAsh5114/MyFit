<script lang="ts">
	import { goto } from '$app/navigation';
	import { days } from '$lib/commonDB.js';
	import MyModal from '$lib/components/MyModal.svelte';
	import ViewExerciseCard from '$lib/components/workout/ViewExerciseCard.svelte';

	export let data;

	let totalSets = 0;
	$: {
		totalSets = 0;
		data.workout.exercisesPerformed.forEach((exercise) => {
			totalSets += exercise.repsLoadRIR.length;
		});
	}

	let averageRIR = 0;
	$: {
		averageRIR = 0;
		data.workout.exercisesPerformed.forEach((exercise) => {
			exercise.repsLoadRIR.forEach((repLoadRIR) => {
				averageRIR += repLoadRIR[2];
			});
		});
		averageRIR = Math.round((averageRIR / totalSets) * 100) / 100;
	}

	let muscleTargetsAndSets: Record<string, number> = {};
	$: {
		muscleTargetsAndSets = {};
		data.workout.exercisesPerformed.forEach((exercise) => {
			if (muscleTargetsAndSets[exercise.muscleTarget]) {
				muscleTargetsAndSets[exercise.muscleTarget] += exercise.repsLoadRIR.length;
			} else {
				muscleTargetsAndSets[exercise.muscleTarget] = exercise.repsLoadRIR.length;
			}
		});
	}

	let confirmDeleteModal: HTMLDialogElement;
	let deletionSuccessfulModal: HTMLDialogElement;
	let deletionErrorModal: HTMLDialogElement;
	let callingEndpoint = false;
	let errorMsg = '';
	async function deleteWorkout() {
		callingEndpoint = true;
		errorMsg = '';
		const reqJSON: APIWorkoutDelete = { workoutIndex: data.workoutIndex };
		const response = await fetch('/api/workouts/delete', {
			method: 'POST',
			body: JSON.stringify(reqJSON),
			headers: {
				'content-type': 'application/json'
			}
		});
		confirmDeleteModal.close();
		callingEndpoint = false;
		if (response.ok) {
			deletionSuccessfulModal.show();
		} else {
			errorMsg = await response.text();
			deletionErrorModal.show();
		}
	}

	function dateFormatter(timestamp: number | undefined) {
		if (!timestamp) return;
		const date = new Date(timestamp);
		return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
	}

	let SFRList: { exercise: WorkoutExercise; SFR: number }[] = [];
	const ratingMap = { none: 0.5, moderate: 1, high: 1.5 };
	const fatigueMap = { none: 1, moderate: 1.5, high: 2 };
	data.workout.exercisesPerformed.forEach((exercise) => {
		let stimulus = 0,
			fatigue = 0;
		if (!exercise.jointPainRating) return;
		if (exercise.pumpRating) {
			stimulus += ratingMap[exercise.pumpRating];
			fatigue += fatigueMap[exercise.jointPainRating];
		}
		if (exercise.disruptionRating) {
			stimulus += ratingMap[exercise.disruptionRating];
			fatigue += fatigueMap[exercise.jointPainRating];
		}
		if (exercise.mindMuscleConnectionRating) {
			stimulus += ratingMap[exercise.mindMuscleConnectionRating];
			fatigue += fatigueMap[exercise.jointPainRating];
		}
		if (stimulus === 0) return;
		SFRList.push({ exercise, SFR: stimulus / fatigue });
	});
	SFRList.sort((a, b) => {
		return b.SFR - a.SFR;
	});

	function getSFRColor(sfr: number) {
		if (sfr < 0.5) return 'text-warning';
		if (sfr < 0.75) return 'text-success';
		return 'text-accent';
	}
</script>

<MyModal title="Delete Mesocycle" titleColor="text-error" bind:dialogElement={confirmDeleteModal}>
	<p>
		Are you sure you want to delete workout
		<span class="font-semibold italic"
			>{data.parentMesocycle?.splitSchedule[data.workout.dayNumber]} ({days[
				data.workout.dayNumber
			]})</span
		>?
	</p>
	<div class="join grid grid-cols-2 w-full mt-4">
		<form on:submit|preventDefault class="join-item">
			<button
				class="join-item btn btn-error text-black w-full"
				on:click={() => {
					if (!callingEndpoint) {
						deleteWorkout();
					}
				}}
			>
				{#if callingEndpoint}
					<span class="loading loading-spinner" />
				{/if}
				Yes
			</button>
		</form>
		<button class="join-item btn btn-secondary"> No </button>
	</div>
</MyModal>
<MyModal
	title="Success"
	titleColor="text-success"
	bind:dialogElement={deletionSuccessfulModal}
	onClose={async () => {
		await goto('/workouts');
	}}
>
	<p>
		Workout <span class="font-semibold italic"
			>{data.parentMesocycle?.splitSchedule[data.workout.dayNumber]} ({days[
				data.workout.dayNumber
			]})</span
		> deleted successfully
	</p>
</MyModal>
<MyModal title="Error" titleColor="text-error" bind:dialogElement={deletionErrorModal}>
	<p>{errorMsg}</p>
</MyModal>

<div class="flex flex-col h-px grow gap-2 w-full overflow-y-auto">
	<div class="stats bg-primary w-full stats-vertical shrink-0">
		<div class="stat">
			<h3>Template</h3>
			<p class="text-secondary font-bold text-xl">
				{data.parentMesocycle?.splitSchedule[data.workout.dayNumber]} ({days[
					data.workout.dayNumber
				]})
			</p>
			<p class=" text-sm">{data.parentMesocycle?.name}</p>
		</div>
		<div class="stat">
			<h3>Date</h3>
			<p class="text-secondary font-bold text-xl">
				{dateFormatter(data.workout.startTimestamp)}
			</p>
		</div>
	</div>
	<div class="stats bg-primary w-full grid-cols-2 grid shrink-0">
		<div class="stat">
			<h3>Average RIR</h3>
			<p class="text-secondary font-bold text-2xl">{averageRIR}</p>
			{#if averageRIR < data.workout.plannedRIR - 0.5}
				<div class=" text-sm text-error">You went too hard</div>
			{:else if averageRIR > data.workout.plannedRIR + 0.5}
				<div class=" text-sm text-error">You went too easy</div>
			{:else}
				<div class=" text-sm">RIR matched with plan</div>
			{/if}
		</div>
		<div class="stat">
			<h3>Planned RIR</h3>
			<p class="text-secondary font-bold text-2xl">{data.workout.plannedRIR}</p>
			<p class=" text-sm">Week {data.workout.weekNumber}</p>
		</div>
	</div>
	<div class="stats bg-primary w-full grid grid-cols-2 place-items-start shrink-0">
		<div class="stat">
			<h3 id="diff-rating-heading">Difficulty rating</h3>
			<div class="font-bold text-2xl text-secondary">
				<div class="rating mt-1">
					{#each Array(5).fill(0) as num, i}
						<input
							type="radio"
							name="difficulty-rating"
							value={i + 1}
							class="mask mask-star bg-warning h-7 w-7"
							bind:group={data.workout.difficultyRating}
							aria-labelledby="diff-rating-heading"
							disabled
						/>
					{/each}
				</div>
			</div>
		</div>
		<div class="stat">
			<h3>Ref. workout</h3>
			<p class="text-secondary font-bold text-2xl">
				{#if data.referenceWorkout}
					{data.referenceWorkout.startTimestamp}
				{:else}
					<span class="text-error">Not found</span>
				{/if}
			</p>
		</div>
	</div>
	<div class="stats bg-primary w-full shrink-0">
		<div class="stat">
			<h3>Muscle targets</h3>
			<div class="flex flex-wrap mt-1.5 gap-1">
				{#each Object.keys(muscleTargetsAndSets) as muscleTarget}
					<span class="badge">{muscleTarget} x {muscleTargetsAndSets[muscleTarget]}</span>
				{/each}
			</div>
		</div>
	</div>
	<ViewExerciseCard bind:workoutExercises={data.workout.exercisesPerformed} />
	{#if SFRList.length > 0}
		<div class="stats bg-primary shrink-0 w-full">
			<div class="stat">
				<h3>Highest SFRs</h3>
				<div class="flex flex-col mt-2">
					{#each SFRList as { exercise, SFR }}
						<div class="flex justify-between text-secondary">
							{exercise.name}
							<p class="font-semibold {getSFRColor(SFR)}">{SFR.toFixed(2)}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
<div class="join grid grid-cols-2 w-full mt-3">
	<button
		class="join-item btn btn-error text-black"
		on:click={() => {
			confirmDeleteModal.show();
		}}>Delete</button
	>
	<button class="join-item btn btn-primary">Edit</button>
</div>
