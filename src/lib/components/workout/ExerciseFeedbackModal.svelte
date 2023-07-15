<script lang="ts">
	import MyModal from '../MyModal.svelte';

	export let exerciseFeedbackModal: HTMLDialogElement;
	export let selectedExercise: WorkoutExercise;
</script>

<MyModal
	bind:dialogElement={exerciseFeedbackModal}
	title="Exercise feedback"
	titleColor="text-accent"
>
	<p>Rate the exercise for appropriate adjustments in the next week</p>
	<div class="flex flex-col mt-4 gap-1">
		<h4 class="uppercase font-semibold">Joint pain rating</h4>
		<div class="flex justify-between gap-1">
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="joint-pain"
				aria-label="No pain"
				id="good-btn"
			/>
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="joint-pain"
				aria-label="Some pain"
				id="ok-btn"
			/>
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="joint-pain"
				aria-label="That hurt"
				id="bad-btn"
			/>
		</div>
	</div>
	<div class="flex flex-col mt-4 gap-1">
		<h4 class="uppercase font-semibold">Muscular pump rating</h4>
		<div class="flex justify-between gap-1">
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="muscular-pump"
				aria-label="No pump"
				id="bad-btn"
			/>
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="muscular-pump"
				aria-label="Decent pump"
				id="ok-btn"
			/>
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="muscular-pump"
				aria-label="Amazing pump"
				id="good-btn"
			/>
		</div>
	</div>
	<div class="flex flex-col mt-4 gap-1">
		<h4 class="uppercase font-semibold">Muscular disruption rating</h4>
		<div class="flex justify-between gap-1">
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="muscular-disruption"
				aria-label="None"
				id="ok-btn"
			/>
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="muscular-disruption"
				aria-label="Somewhat"
				id="good-btn"
			/>
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="muscular-disruption"
				aria-label="Too much"
				id="bad-btn"
			/>
		</div>
	</div>
	<div class="flex flex-col mt-4 gap-1">
		<h4 class="uppercase font-semibold">Mind muscle connection rating</h4>
		<div class="flex justify-between gap-1">
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="mind-muscle-connection"
				aria-label="None"
				id="bad-btn"
			/>
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="mind-muscle-connection"
				aria-label="Somewhat"
				id="ok-btn"
			/>
			<input
				class="btn basis-1/3 grow-0 shrink-0 text-sm"
				type="radio"
				name="mind-muscle-connection"
				aria-label="Perfect"
				id="good-btn"
			/>
		</div>
	</div>
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
