<script lang="ts">
	import SplitExercisesTable from '$lib/components/mesocycle/SplitExercisesTable.svelte';
	import {
		splitExercises,
		splitSchedule,
		isExercisesValidStore,
		errorMsgs,
		isSplitValidStore
	} from '../newMesoStore';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { days } from '$lib/commonDB';

	let firstValidDayIndex = 0;
	for (let i = 0; i < 7; i++) {
		if ($splitSchedule[i] !== '') {
			firstValidDayIndex = i;
			break;
		}
	}
	let currentDay = days[firstValidDayIndex];

	let weeklyCalendar: HTMLInputElement[] = [];
	function isExercisesValid() {
		let invalidDays: string[] = [];
		for (let i = 0; i < 7; i++) {
			if ($splitExercises[i].length === 0 && $splitSchedule[i] !== '') {
				$errorMsgs = ['Add at least one exercise to each non rest day'];
				weeklyCalendar[i].classList.add('animate-pulse');
				invalidDays.push(days[i]);
			}
		}
		if (invalidDays.length !== 0) {
			$errorMsgs[1] = 'Remaining days: ';
			invalidDays.forEach((day) => {
				$errorMsgs[1] += day + ', ';
			});
			$errorMsgs[1] = $errorMsgs[1].substring(0, $errorMsgs[1].length - 2);
			return false;
		}
		return true;
	}
	onMount(() => {
		if (!$isSplitValidStore || !$isSplitValidStore()) {
			goto('/mesocycles/new/split');
		}
		$isExercisesValidStore = isExercisesValid;
	});
</script>

<div class="join w-full justify-between my-2">
	{#each days as day, i}
		{#if $splitSchedule[i] === ''}
			<input
				class="join-item btn btn-square"
				type="radio"
				name="day"
				aria-label={day}
				bind:group={currentDay}
				value={day}
				disabled
			/>
		{:else}
			<input
				class="join-item btn btn-square btn-secondary"
				type="radio"
				name="day"
				aria-label={day}
				bind:group={currentDay}
				value={day}
				on:click={() => {
					weeklyCalendar[i].classList.remove('animate-pulse');
				}}
				bind:this={weeklyCalendar[i]}
			/>
		{/if}
	{/each}
</div>
<SplitExercisesTable
	bind:currentDay
	bind:workoutName={$splitSchedule[days.indexOf(currentDay)]}
	bind:splitExercises={$splitExercises[days.indexOf(currentDay)]}
/>
