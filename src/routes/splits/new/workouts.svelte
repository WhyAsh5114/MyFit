<script context="module" lang="ts">
	export { loadUserOrRedirectToLogin as load } from '$lib/loadUserOrRedirectToLogin';
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import ExerciseTable from '$lib/ExerciseTable.svelte';
	import { onMount } from 'svelte';
	import { SplitName, SplitSchedule } from '../split_store';

	// Redirect if stores are empty
	const empty_schedule = { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' };
	onMount(() => {
		if ($SplitName === '' || $SplitSchedule === empty_schedule) {
			goto('/splits/new');
		}
	});
</script>

<svelte:head>
	<title>MyFit | New split</title>
</svelte:head>

<div class="grid grid-cols-4 lg:grid-cols-7 gap-2">
	{#each Object.keys($SplitSchedule) as day}
		<div class="flex flex-col w-full normal-case text-base font-normal">
			<p class="bg-primary text-center w-full rounded-t-lg py-0.5 font-semibold">{day}</p>
			<p class="text-center bg-secondary text-black rounded-b-lg py-0.5">{$SplitSchedule[day]}</p>
		</div>
	{/each}
</div>
<div class="flex justify-center w-full h-full">
    <ExerciseTable
        workoutName="Push"
        exercises={[
            { id: 1, name: 'Push up', reps: 12, sets: 3, load: 45 },
            { id: 2, name: 'Shoulder press', reps: 5, sets: 3, load: 15 }
        ]}
    />
</div>
