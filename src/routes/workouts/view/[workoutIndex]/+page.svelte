<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { dateFormatter, days, getSFR } from '$lib/commonDB.js';
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

	let SFRList: { exercise: WorkoutExercise; SFR: number }[] = [];
	data.workout.exercisesPerformed.forEach((exercise) => {
		const SFR = getSFR(exercise);
		if (!SFR) return;
		SFRList.push({ exercise, SFR });
	});
	SFRList.sort((a, b) => {
		return b.SFR - a.SFR;
	});

	function getSFRColor(sfr: number) {
		if (sfr < 1) return 'text-error';
		if (sfr < 1.5) return 'text-warning';
		return 'text-accent';
	}

	// Convert object to list for easier UI integration
	let sorenessData: {
		muscleTarget: (typeof commonMuscleGroups)[number];
		sorenessValue: Workout['muscleSorenessToNextWorkout'][(typeof commonMuscleGroups)[number]];
	}[] = [];
	for (const [muscleTarget, sorenessValue] of Object.entries(data.workout.muscleSorenessToNextWorkout)) {
		if (!sorenessValue) continue;
		sorenessData.push({ muscleTarget: muscleTarget as (typeof commonMuscleGroups)[number], sorenessValue });
	}
	const sorenessToColorMap = {
		none: 'text-warning',
		'recovered on time': 'text-success',
		'interfered with workout': 'text-error'
	};

	let muscleGroupWorkloadsList: {
		muscleGroup: (typeof commonMuscleGroups)[number];
		workloadValue: 'low' | 'moderate' | 'high';
	}[] = [];
	for (const [muscleGroup, workloadValue] of Object.entries(data.workout.muscleGroupWorkloads)) {
		if (!muscleGroup || !workloadValue) continue;
		muscleGroupWorkloadsList.push({ muscleGroup: muscleGroup as (typeof commonMuscleGroups)[number], workloadValue });
	}
	const workloadToColorMap = {
		low: 'text-warning',
		moderate: 'text-success',
		high: 'text-error'
	};
</script>

<MyModal title="Delete Workout" titleColor="text-error" bind:dialogElement={confirmDeleteModal}>
	<p>
		Are you sure you want to delete workout
		<span class="font-semibold italic"
			>{data.parentMesocycle?.splitSchedule[data.workout.dayNumber]} ({days[data.workout.dayNumber]})</span
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
			>{data.parentMesocycle?.splitSchedule[data.workout.dayNumber]} ({days[data.workout.dayNumber]})</span
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
					{dateFormatter(data.referenceWorkout.startTimestamp)}
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
				<h3>Stimulus to Fatigue Ratios</h3>
				<div class="h-px w-full bg-secondary my-0.5" />
				<ul class="flex flex-col mt-2">
					{#each SFRList as { exercise, SFR }}
						<li class="flex justify-between text-secondary">
							{exercise.name}
							<p class="font-semibold {getSFRColor(SFR)}">{SFR.toFixed(2)}</p>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
	{#if sorenessData.length > 0}
		<div class="stats bg-primary shrink-0 w-full">
			<div class="stat">
				<h3>Soreness carryover to next workouts</h3>
				<div class="h-px w-full bg-secondary my-0.5" />
				<ul class="flex flex-col mt-2">
					{#each sorenessData as { muscleTarget, sorenessValue }}
						<li class="flex justify-between text-secondary">
							{muscleTarget}
							<p class="capitalize font-semibold {sorenessValue ? sorenessToColorMap[sorenessValue] : ''}">
								{sorenessValue}
							</p>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
	{#if muscleGroupWorkloadsList.length > 0}
		<div class="stats bg-primary shrink-0 w-full">
			<div class="stat">
				<h3>Muscle workloads</h3>
				<div class="h-px w-full bg-secondary my-0.5" />
				<ul class="flex flex-col mt-2">
					{#each muscleGroupWorkloadsList as { muscleGroup, workloadValue }}
						<li class="flex justify-between text-secondary">
							{muscleGroup}
							<p class="capitalize font-semibold {workloadToColorMap[workloadValue]}">
								{workloadValue}
							</p>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</div>
<div class="join grid grid-cols-2 w-full mt-2">
	<button
		class="join-item btn btn-error text-black"
		on:click={() => {
			confirmDeleteModal.show();
		}}>Delete</button
	>
	<a class="join-item btn btn-primary" href="/workouts/edit/{data.workoutIndex}">
		{#if $navigating?.to?.url.pathname === `/workouts/edit/${data.workoutIndex}`}
			<span class="loading loading-spinner"></span>
		{/if}
		Edit
	</a>
</div>
