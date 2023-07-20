<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { dateFormatter, days } from '$lib/commonDB.js';
	import MyModal from '$lib/components/MyModal.svelte';
	import WorkoutExerciseCard from '$lib/components/workout/WorkoutExerciseCard.svelte';
	export let data;

	let setsPerformedPerExercise: boolean[][] = [];
	data.workout.exercisesPerformed.forEach((exercise) => {
		setsPerformedPerExercise.push(Array(exercise.repsLoadRIR.length).fill(true));
	});

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

	let callingEndpoint = false;
	let errorMsg = '';
	async function updateWorkout() {
		callingEndpoint = true;
		/* Have to do this, otherwise JSON serialization through load functions
		 converts values to null which get preserved when calling endpoint
		 That gives an error as it should be 'none' | 'just recovered' | 'interfered with workout' | undefined */
		for (let [muscleTarget, sorenessValue] of Object.entries(data.workout.muscleSorenessToNextWorkout)) {
			if (data.workout.muscleSorenessToNextWorkout[muscleTarget as (typeof commonMuscleGroups)[number]] === null) {
				data.workout.muscleSorenessToNextWorkout[muscleTarget as (typeof commonMuscleGroups)[number]] = undefined;
			}
		}

		const reqBody: APIWorkoutUpdate = {
			workoutIndex: data.workoutIndex,
			workout: data.workout,
			sorenessValues: data.musclesTargetedPreviously
		};
		const response = await fetch('/api/workouts/update', {
			method: 'POST',
			body: JSON.stringify(reqBody),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (response.ok) successModal.show();
		else {
			errorMsg = await response.text();
			errorModal.show();
		}
		callingEndpoint = false;
	}

	let successModal: HTMLDialogElement;
	let errorModal: HTMLDialogElement;
</script>

<MyModal
	title="Success"
	titleColor="text-success"
	bind:dialogElement={successModal}
	onClose={() => {
		goto(`/workouts/view/${data.workoutIndex}`);
	}}
>
	<p>Workout updated successfully</p>
</MyModal>
<MyModal title="Error" titleColor="text-error" bind:dialogElement={errorModal}>
	<p>{errorMsg}</p>
</MyModal>
<div class="flex flex-col h-px grow gap-2 w-full overflow-y-auto">
	<div class="stats bg-primary w-full stats-vertical shrink-0">
		<div class="stat">
			<h3>Template</h3>
			<p class="text-secondary font-bold text-xl">
				{data.parentMesocycle?.splitSchedule[data.workout.dayNumber]} ({days[data.workout.dayNumber]})
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
				<div class=" text-sm">Matched with plan</div>
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
							class="mask mask-star bg-warning"
							bind:group={data.workout.difficultyRating}
							aria-labelledby="diff-rating-heading"
						/>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<WorkoutExerciseCard
		bind:workoutExercises={data.workout.exercisesPerformed}
		bind:setsPerformedPerExercise
		bind:musclesTargetedPreviously={data.musclesTargetedPreviously}
		bind:muscleWorkloads={data.workout.muscleGroupWorkloads}
		workoutPerformed={true}
	/>
</div>
<div class="join grid grid-cols-2 w-full mt-2">
	<a class="join-item btn btn-primary" href="/workouts/view/{data.workoutIndex}">
		{#if $navigating?.to?.url.pathname === `/workouts/view/${data.workoutIndex}`}
			<span class="loading loading-spinner"></span>
		{/if}
		Cancel
	</a>
	<button
		class="join-item btn btn-accent"
		on:click={() => {
			if (!callingEndpoint) updateWorkout();
		}}
	>
		{#if callingEndpoint}
			<span class="loading loading-spinner"></span>
		{/if}
		Save
	</button>
</div>
