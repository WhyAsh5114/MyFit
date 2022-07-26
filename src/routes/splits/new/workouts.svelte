<script context="module" lang="ts">
	export { loadUserOrRedirectToLogin as load } from '$lib/loadUserOrRedirectToLogin';
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import ExerciseTable from '$lib/ExerciseTable.svelte';
	import { onMount } from 'svelte';
	import { SplitName, SplitSchedule, SplitWorkouts } from '../split_store';

	let schedule_elements: Record<string, HTMLDivElement> = {};
	let selected_unique_workout: string;
	let split_workouts = $SplitWorkouts;

	const unique_workouts = new Map<string, string[]>();
	for (const day in $SplitSchedule) {
		const workout = $SplitSchedule[day];
		if (workout !== 'Rest' && !unique_workouts.has(workout)) {
			unique_workouts.set(workout, [day]);
		} else if (workout !== 'Rest') {
			unique_workouts.get(workout)?.push(day);
		}
	}

	const first_unique_workout: string = unique_workouts.keys().next().value;
	selected_unique_workout = first_unique_workout;

	// Redirect if stores are empty
	const empty_schedule = { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' };
	onMount(() => {
		if ($SplitName === '' || $SplitSchedule === empty_schedule) {
			goto('/splits/new');
			return;
		}

		// Highlight the first unique workout days
		const first_unique_workout_schedule: string[] = unique_workouts.values().next().value;
		for (const day of first_unique_workout_schedule) {
			schedule_elements[day]?.classList.add('border-4');
		}

		for (const day in $SplitSchedule) {
			const workout = $SplitSchedule[day];
			if (workout === 'Rest') {
				schedule_elements[day]?.classList.add('opacity-50');
				schedule_elements[day]?.classList.remove('hover:border-4');
			}
		}
	});

	function change_selected_unique_workout(_day: string) {
		if ($SplitSchedule[_day] === 'Rest') return;
		const selected_workout = $SplitSchedule[_day];
		for (let [day, workout] of Object.entries($SplitSchedule)) {
			if (workout === selected_workout) {
				schedule_elements[day]?.classList.add('border-4');
			} else {
				schedule_elements[day]?.classList.remove('border-4');
			}
		}
		selected_unique_workout = selected_workout;
	}
</script>

<svelte:head>
	<title>MyFit | New split</title>
</svelte:head>

<div
	class="grid grid-cols-4 lg:grid-cols-7 gap-2 w-full max-w-xl place-self-center place-items-center"
>
	{#each Object.keys($SplitSchedule) as day}
		<div
			class="flex flex-col w-full normal-case text-base font-normal rounded-xl cursor-pointer border-accent hover:border-4"
			bind:this={schedule_elements[day]}
			on:click={() => change_selected_unique_workout(day)}
		>
			<p class="bg-primary text-center w-full rounded-t-lg py-0.5 font-semibold">{day}</p>
			<p class="text-center bg-secondary text-black rounded-b-lg py-0.5">{$SplitSchedule[day]}</p>
		</div>
	{/each}
</div>
<div class="flex justify-center w-full flex-1">
	<ExerciseTable
		workoutName={selected_unique_workout}
		bind:exercises={split_workouts[selected_unique_workout]}
	/>
</div>
<button class="basis-10 normal-case text-base btn btn-primary"> Set split options </button>
