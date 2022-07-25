<script context="module" lang="ts">
	export { loadUserOrRedirectToLogin as load } from '$lib/loadUserOrRedirectToLogin';
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import MyModal from '$lib/MyModal.svelte';
	import { onMount } from 'svelte';
	import { SplitName, SplitSchedule } from '../split_store';
	export let user: UserData;

	let split_name = '';
	let days_input: Record<string, string> = {
		Mon: '',
		Tue: '',
		Wed: '',
		Thu: '',
		Fri: '',
		Sat: '',
		Sun: ''
	};
	let unique_workouts = new Set();

	onMount(() => {
		split_name = $SplitName;
		days_input = $SplitSchedule;
	})

	let modalTexts: string[];
	let modalOpen: boolean;

	function update_workouts() {
		let local_unique_workouts = new Set();
		Object.values(days_input).forEach((day_input) => {
			if (day_input !== '' && day_input.toLowerCase() !== 'rest') {
				local_unique_workouts.add(day_input);
			}
		});
		unique_workouts = local_unique_workouts;
	}

	function create_schedule() {
		let errors = [];
		if (split_name === '') {
			errors.push('Enter split name');
		}
		if (split_name in user.splits) {
			errors.push('Split already exists');
		}
		if (unique_workouts.size === 0) {
			errors.push('Add at least one workout');
		}
		if (errors.length > 0) {
			modalTexts = errors;
			modalOpen = true;
			return;
		}

		SplitName.set(split_name);

		// Remove rest days and replace with ''
		for (let day in days_input) {
			if (days_input[day].toLowerCase() === 'rest' || days_input[day] == '') {
				days_input[day] = 'Rest';
			}
		}
		SplitSchedule.set(days_input);
		goto('/splits/new/workouts');
	}
</script>

<svelte:head>
	<title>MyFit | New split</title>
</svelte:head>
<MyModal {modalTexts} modalTitle="Error" bind:modalOpen />
<form on:submit|preventDefault class="flex flex-col h-full justify-center items-center">
	<div class="flex flex-col gap-10 justify-center items-center max-w-xs flex-grow">
		<label class="input-group input-group-vertical shadow-black shadow-lg">
			<p class="text-center bg-primary py-1 font-semibold">Split name</p>
			<input
				type="text"
				name="split-name"
				class="input bg-secondary input-sm border-2 text-lg text-black col-span-2 text-center"
				bind:value={split_name}
				data-test-id="split-name-input"
				required
			/>
		</label>
		<div class="flex flex-col gap-3.5 bg-primary p-4 rounded-lg shadow-black shadow-lg">
			{#each Object.keys(days_input) as day, i}
				<label class="input-group input-group-sm shadow-md shadow-black">
					<p class="bg-accent text-black w-20 font-semibold text-center">{day}</p>
					<input
						type="text"
						name={day}
						data-test-id={day}
						class="input input-bordered w-full text-base bg-secondary text-black input-sm col-span-2 text-center"
						bind:value={days_input[day]}
						on:input={update_workouts}
						on:focus={update_workouts}
					/>
				</label>
			{/each}
		</div>
	</div>
	<button
		type="submit"
		class="btn normal-case lg:btn-lg btn-primary w-full mb-2 lg:text-lg"
		on:click={create_schedule}
		data-test-id="create-schedule-button"
	>
		{#if unique_workouts.size === 1}
			Create {unique_workouts.size} unique workout
		{:else}
			Create {unique_workouts.size} unique workouts
		{/if}
	</button>
</form>
