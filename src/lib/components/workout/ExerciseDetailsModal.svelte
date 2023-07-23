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
		stimulusRating: { none: 'text-error', moderate: 'text-warning', high: 'text-success' }
	};
</script>

<MyModal title={`${viewingExercise?.name} details`} titleColor="text-accent" bind:dialogElement={exerciseDetailModal}>
	<dl class="stats stats-vertical w-full">
		<div class="stat py-2">
			<dt>Name</dt>
			<dd class="stat-value text-xl">{viewingExercise?.name}</dd>
		</div>
		<div class="stat py-2">
			<dt>Sets</dt>
			<dd class="stat-value text-xl">
				{viewingExercise?.repsLoadRIR.length}
				{viewingExercise?.setType} sets
			</dd>
		</div>
		<div class="stat py-2">
			<dt>Rep range</dt>
			<dd class="stat-value text-xl">
				{viewingExercise?.repRangeStart} to {viewingExercise?.repRangeEnd}
			</dd>
		</div>
		<div class="stat py-2">
			<dt>Muscle target</dt>
			<dd class="stat-value text-xl text-error">
				{viewingExercise?.muscleTarget}
			</dd>
		</div>
		{#if viewingExercise?.jointPainRating}
			<div class="stat py-2">
				<dt>Joint pain rating</dt>
				<dd class="stat-value text-xl capitalize {colorMap.jointPainRating[viewingExercise?.jointPainRating]}">
					{viewingExercise?.jointPainRating}
				</dd>
			</div>
		{/if}
		{#if viewingExercise?.pumpRating}
			<div class="stat py-2">
				<dt>Pump rating</dt>
				<dd class="stat-value text-xl capitalize {colorMap.stimulusRating[viewingExercise?.pumpRating]}">
					{viewingExercise?.pumpRating}
				</dd>
			</div>
		{/if}
	</dl>
</MyModal>
