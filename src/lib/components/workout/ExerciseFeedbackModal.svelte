<script lang="ts">
	import MyModal from '../MyModal.svelte';

	export let exerciseFeedbackModal: HTMLDialogElement;
	export let selectedExercise: WorkoutExercise | undefined;

	const ratingMap: Record<number, string> = { 0: 'none', 1: 'moderate', 2: 'high' };

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
	}
</script>

<MyModal
	bind:dialogElement={exerciseFeedbackModal}
	title="Exercise feedback"
	titleColor="text-accent"
>
	<p>
		Rate <span class="font-semibold italic">{selectedExercise?.name}</span> for appropriate adjustments
		in the next week
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
							required
						/>
					{/each}
				</div>
			</div>
		{/each}
		<button class="btn btn-block mt-2 btn-accent"> Submit feedback </button>
	</form>
</MyModal>

<style>
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
