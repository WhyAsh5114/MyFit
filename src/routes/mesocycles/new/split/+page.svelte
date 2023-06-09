<script lang="ts">
	import MyModal from '$lib/components/MyModal.svelte';
	import { onMount } from 'svelte';
	import { errorMsgs, isSplitValidStore, splitSchedule, isBasicsValidStore } from '../newMesoStore';
	import { commonSplits, days } from '$lib/commonDB';
	import { goto } from '$app/navigation';

	function isSplitValid() {
		let totalWorkouts = 0;
		$splitSchedule.forEach((workout) => {
			if (workout !== '' && workout.toLowerCase() !== 'rest') {
				totalWorkouts++;
			}
		});
		if (totalWorkouts > 0) {
			return true;
		}
		$errorMsgs = [
			'Add at least one workout to the split',
			'Or use one of the common splits for reference'
		];
		return false;
	}
	onMount(() => {
		if (!$isBasicsValidStore || !$isBasicsValidStore()) {
			goto('/mesocycles/new/basics');
		}
		$isSplitValidStore = isSplitValid;
	});

	let selectSplitModal: HTMLDialogElement;
	let selectedCommonSplit: string;

	let splitHelpModal: HTMLDialogElement;
</script>

<MyModal
	title="Select a common split"
	titleColor="text-accent"
	bind:dialogElement={selectSplitModal}
>
	<div class="flex gap-2 items-center">
		<select class="select select-bordered grow" bind:value={selectedCommonSplit}>
			<option disabled selected>Choose a common split</option>
			{#each Object.keys(commonSplits) as split}
				<option>{split}</option>
			{/each}
		</select>
		<button
			class="btn btn-accent"
			on:click={() => {
				$splitSchedule = JSON.parse(JSON.stringify(commonSplits[selectedCommonSplit]));
			}}>Select</button
		>
	</div>
</MyModal>
<MyModal title="Workout split" titleColor="text-accent" bind:dialogElement={splitHelpModal}>
	<p>
		A workout split is the splitting up of workouts throughout the week primarily by body region,
		movement, specific body part, or by lift.
	</p>
	<p>
		A workout split should try to stimulate each muscle group 2x a week for optimal hypertrophy.
	</p>
</MyModal>
<div class="flex items-center mb-2 justify-between w-full max-w-xs">
	<button
		class="btn btn-primary text-accent btn-sm"
		on:click={() => {
			selectSplitModal.show();
		}}>Use common splits</button
	>
	<button
		class="help-button"
		on:click={() => {
			splitHelpModal.show();
		}}>?</button
	>
</div>
<div class="bg-primary flex flex-col gap-3 p-5 rounded-lg w-full max-w-xs">
	{#each days as day, i}
		<div class="join bg-secondary items-center">
			<label for={day} class="join-item shrink-0 basis-12 pl-2 text-black font-semibold"
				>{day}</label
			>
			<input
				type="text"
				class="join-item input input-sm text-base text-center w-full"
				bind:value={$splitSchedule[i]}
			/>
		</div>
	{/each}
</div>
