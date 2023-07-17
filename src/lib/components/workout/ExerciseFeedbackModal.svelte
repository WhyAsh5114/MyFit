<script lang="ts">
	import MyModal from '../MyModal.svelte';

	export let workoutExercises: WorkoutExercise[];
	export let feedbackTaken: boolean[];
	export let exerciseFeedbackModal: HTMLDialogElement;
	export let selectedExercise: WorkoutExercise | undefined;
	export let muscleWorkloads: Workout['muscleGroupWorkloads'];
	export let musclesTargetedPreviously: MuscleSorenessData[];

	const ratingMap: Record<number, string> = { 0: 'none', 1: 'moderate', 2: 'high' };
	const workloadMap: Record<number, string> = { 0: 'low', 1: 'moderate', 2: 'high' };

	let feedbackSystem: Record<string, Record<string, 'good-btn' | 'ok-btn' | 'bad-btn'>> = {
		'Joint pain rating': { 'No pain': 'good-btn', 'Some pain': 'ok-btn', 'That hurt': 'bad-btn' },
		'Pump rating': { 'No pump': 'bad-btn', 'Decent pump': 'ok-btn', 'Amazing pump': 'good-btn' },
		'Disruption rating': {
			'No disruption': 'bad-btn',
			'Some disruption': 'ok-btn',
			'Lots of disruption': 'good-btn'
		},
		'Mind muscle connection rating': { None: 'bad-btn', Decent: 'ok-btn', Perfect: 'good-btn' }
	};

	let feedbackValues: Record<string, 'none' | 'moderate' | 'high' | undefined> = {
		'Joint pain rating': undefined,
		'Pump rating': undefined,
		'Disruption rating': undefined,
		'Mind muscle connection rating': undefined
	};

	let sorenessDataField: MuscleSorenessData | undefined;
	function openWorkloadAndSorenessModal() {
		let totalExercisesForTargetMuscle: number[] = [];
		workoutExercises.forEach((exercise, i) => {
			if (exercise.muscleTarget === selectedExercise?.muscleTarget) {
				totalExercisesForTargetMuscle.push(i);
			}
		});
		let feedbacksRemainingForTargetMuscle = totalExercisesForTargetMuscle.length;
		totalExercisesForTargetMuscle.forEach((exerciseIdx) => {
			if (feedbackTaken[exerciseIdx]) {
				feedbacksRemainingForTargetMuscle--;
			}
		});

		sorenessDataField = musclesTargetedPreviously.find((x) => x.muscleTarget === selectedExercise?.muscleTarget);
		if (sorenessDataField?.workoutIndex === undefined) {
			sorenessDataField = undefined;
		}

		if (feedbacksRemainingForTargetMuscle === 0) {
			workloadAndSorenessModal.show();
		}
	}

	function submitFeedback() {
		if (!selectedExercise) {
			return;
		}

		selectedExercise.jointPainRating = feedbackValues['Joint pain rating'];
		selectedExercise.pumpRating = feedbackValues['Pump rating'];
		selectedExercise.disruptionRating = feedbackValues['Disruption rating'];
		selectedExercise.mindMuscleConnectionRating = feedbackValues['Mind muscle connection rating'];

		exerciseFeedbackModal.close();
		Object.keys(feedbackValues).forEach((value) => {
			feedbackValues[value] = undefined;
		});

		openWorkloadAndSorenessModal();
	}

	let workloadAndSorenessModal: HTMLDialogElement;
</script>

{#if selectedExercise}
	<MyModal
		bind:dialogElement={workloadAndSorenessModal}
		title={`${selectedExercise?.muscleTarget} workload rating`}
		titleColor="text-accent"
	>
		<p>
			How much was the workload for the
			<span class="font-semibold italic">{selectedExercise.muscleTarget}</span> muscles in this workout?
		</p>
		<div class="h-px w-full bg-secondary mt-2 mb-4" />
		<form
			class="flex flex-col gap-2"
			on:submit|preventDefault={() => {
				workloadAndSorenessModal.close();
			}}
		>
			<div class="flex flex-col">
				<h3 class="font-semibold mt-2">Workload rating</h3>
				<div class="grid grid-cols-3 gap-1 mt-1">
					{#each [["Could've done more", 'ok-btn'], ['Just right', 'good-btn'], ['Too much work', 'bad-btn']] as choice, i}
						<input
							class="btn"
							type="radio"
							name="Workload rating"
							aria-label={choice[0]}
							bind:group={muscleWorkloads[selectedExercise.muscleTarget]}
							value={workloadMap[i]}
							id={choice[1]}
						/>
					{/each}
				</div>
			</div>
			{#if sorenessDataField}
				<div class="flex flex-col">
					<h3 class="font-semibold mt-2">Soreness rating</h3>
					<div class="grid grid-cols-3 gap-1 mt-1">
						{#each [['none', 'ok-btn'], ['recovered on time', 'good-btn'], ['interfered with workout', 'bad-btn']] as choice, i}
							<input
								class="btn"
								type="radio"
								name="Soreness rating"
								aria-label={choice[0]}
								bind:group={sorenessDataField.sorenessRating}
								value={workloadMap[i]}
								id={choice[1]}
							/>
						{/each}
					</div>
				</div>
			{/if}
			<button class="btn btn-block mt-2 btn-accent"> Submit feedback </button>
		</form>
	</MyModal>
{/if}

<MyModal
	bind:dialogElement={exerciseFeedbackModal}
	title="Exercise feedback"
	titleColor="text-accent"
	onClose={openWorkloadAndSorenessModal}
>
	<p>
		Rate <span class="font-semibold italic">{selectedExercise?.name}</span> for appropriate adjustments in the next week
	</p>
	<div class="h-px w-full bg-secondary mt-2 mb-4" />
	<form class="flex flex-col gap-2" on:submit|preventDefault={submitFeedback}>
		{#each Object.keys(feedbackSystem) as item}
			<div class="flex flex-col">
				<h3 class="font-semibold">{item}</h3>
				<div class="grid grid-cols-3 gap-1 mt-1">
					{#each Object.keys(feedbackSystem[item]) as choice, i}
						<input
							class="btn"
							type="radio"
							name={item}
							aria-label={choice}
							id={feedbackSystem[item][choice]}
							bind:group={feedbackValues[item]}
							value={ratingMap[i]}
						/>
					{/each}
				</div>
			</div>
		{/each}
		<button class="btn btn-block mt-2 btn-accent"> Submit feedback </button>
	</form>
</MyModal>

<style lang="postcss">
	#good-btn:checked {
		@apply bg-success text-black;
	}

	#ok-btn:checked {
		@apply bg-warning text-black;
	}

	#bad-btn:checked {
		@apply bg-error text-black;
	}
</style>
