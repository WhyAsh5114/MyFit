<script lang="ts">
	import MyModal from '../MyModal.svelte';

	export let viewingExercise: WorkoutExercise | undefined;
	let exerciseDetailModal: HTMLDialogElement;

	$: {
		if (viewingExercise) {
			exerciseDetailModal.show();
		}
	}

	let colorMap = {
		jointPainRating: { none: 'text-accent', moderate: 'text-warning', high: 'text-error' },
		pumpRating: { none: 'text-error', moderate: 'text-warning', high: 'text-success' }
	};
</script>

<MyModal
	title={`${viewingExercise?.name} details`}
	titleColor="text-accent"
	bind:dialogElement={exerciseDetailModal}
>
	<div class="stats stats-vertical w-full">
		<div class="stat">
			<h4>Name</h4>
			<p class="stat-value text-xl">{viewingExercise?.name}</p>
		</div>
		<div class="stat">
			<h4>Sets</h4>
			<p class="stat-value text-xl">
				{viewingExercise?.repsLoadRIR.length}
				{viewingExercise?.setType} sets
			</p>
		</div>
		<div class="stat">
			<h4>Rep range</h4>
			<p class="stat-value text-xl">
				{viewingExercise?.repRangeStart} to {viewingExercise?.repRangeEnd}
			</p>
		</div>
		<div class="stat">
			<h4>Muscle target</h4>
			<p class="stat-value text-xl text-error">
				{viewingExercise?.muscleTarget}
			</p>
		</div>
		{#if viewingExercise?.jointPainRating}
			<div class="stat">
				<h4>Joint pain rating</h4>
				<p
					class="stat-value text-xl capitalize {colorMap.jointPainRating[
						viewingExercise?.jointPainRating
					]}"
				>
					{viewingExercise?.jointPainRating}
				</p>
			</div>
		{/if}
		{#if viewingExercise?.pumpRating}
			<div class="stat">
				<h4>Pump rating</h4>
				<p class="stat-value text-xl capitalize {colorMap.pumpRating[viewingExercise?.pumpRating]}">
					{viewingExercise?.pumpRating}
				</p>
			</div>
		{/if}
		{#if viewingExercise?.disruptionRating}
			<div class="stat">
				<h4>Disruption rating</h4>
				<p class="stat-value text-xl capitalize {colorMap.pumpRating[viewingExercise?.disruptionRating]}">
					{viewingExercise?.pumpRating}
				</p>
			</div>
		{/if}
	</div>
</MyModal>
