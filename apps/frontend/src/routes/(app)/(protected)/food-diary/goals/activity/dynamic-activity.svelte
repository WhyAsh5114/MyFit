<script lang="ts">
	import Button from '#lib/components/ui/button/button.svelte';
	import Separator from '#lib/components/ui/separator/separator.svelte';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import { Health } from '@capgo/capacitor-health';
	import { CheckIcon, HeartHandshakeIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { data = $bindable() }: { data?: 'unavailable' | 'granted' | 'denied' } = $props();

	let requestingPermissions = $state(false);
	let todaysSteps = $state<number | null>();
	let todaysWeight = $state<number | null>();
	let todaysCalories = $state<number | null>();

	onMount(async () => {
		const availability = await Health.isAvailable();
		if (!availability.available) {
			data = 'unavailable';
			return;
		}

		const isAuthorized = await Health.checkAuthorization({
			read: ['steps', 'weight', 'calories']
		});
		if (isAuthorized.readAuthorized.length < 3) {
			data = 'denied';
			return;
		}

		await loadTodaysData();
		data = 'granted';
	});

	async function requestPermissions() {
		try {
			requestingPermissions = true;
			const response = await Health.requestAuthorization({
				read: ['steps', 'weight', 'calories']
			});
			requestingPermissions = false;
			if (response.readAuthorized.length === 3) data = 'granted';
			else data = 'denied';
		} catch (error) {
			console.error('Permission request failed:', error);
			data = 'denied';
		}
	}

	async function loadTodaysData() {
		try {
			const today = new Date();
			const startOfDay = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate()
			).toISOString();
			const endOfDay = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate() + 1
			).toISOString();

			const { samples: stepsSamples } = await Health.readSamples({
				dataType: 'steps',
				startDate: startOfDay,
				endDate: endOfDay,
				limit: 1
			});
			todaysSteps = stepsSamples.at(0)?.value ?? null;

			const { samples: weightSamples } = await Health.readSamples({
				dataType: 'weight',
				startDate: startOfDay,
				endDate: endOfDay,
				limit: 1
			});
			todaysWeight = weightSamples.at(0)?.value ?? null;

			const { samples: caloriesSamples } = await Health.readSamples({
				dataType: 'calories',
				startDate: startOfDay,
				endDate: endOfDay,
				limit: 1
			});
			todaysCalories = caloriesSamples.at(0)?.value ?? null;
		} catch (error) {
			console.error("Failed to load today's health data:", error);
		}
	}
</script>

<div class="text-xs text-muted-foreground">
	{#if data === 'unavailable'}
		<p>{m['foodDiary.activityGoal.healthUnavailable']()}</p>
	{:else if data === 'denied'}
		<p>{m['foodDiary.activityGoal.healthDenied']()}</p>
		<Button
			class="mt-2 w-full"
			size="sm"
			onclick={requestPermissions}
			disabled={requestingPermissions}
		>
			{#if requestingPermissions}
				{m['foodDiary.activityGoal.healthRequesting']()}
				<Spinner />
			{:else}
				{m['foodDiary.activityGoal.healthGrant']()}
				<HeartHandshakeIcon />
			{/if}
		</Button>
	{:else if data === 'granted'}
		<div class="w-full">
			<span class="flex items-center gap-2 text-sm font-medium text-primary">
				<CheckIcon class="size-4" />
				{m['foodDiary.activityGoal.healthGranted']()}
			</span>
			<Separator class="my-2 bg-secondary" />
			<div class="grid grid-cols-2 gap-1">
				<p class="text-foreground">{m['foodDiary.activityGoal.todaysSteps']()}</p>
				<p class="ml-auto font-semibold">
					{#if todaysSteps === null}
						{m['foodDiary.activityGoal.noDataToday']()}
					{:else if todaysSteps === undefined}
						<Spinner />
					{:else}
						{todaysSteps}
					{/if}
				</p>
				<p class="text-foreground">{m['foodDiary.activityGoal.todaysWeight']()}</p>
				<p class="ml-auto font-semibold">
					{#if todaysWeight === null}
						{m['foodDiary.activityGoal.noDataToday']()}
					{:else if todaysWeight === undefined}
						<Spinner />
					{:else}
						{todaysWeight} kg
					{/if}
				</p>
				<p class="text-foreground">{m['foodDiary.activityGoal.todaysCalories']()}</p>
				<p class="ml-auto font-semibold">
					{#if todaysCalories === null}
						{m['foodDiary.activityGoal.noDataToday']()}
					{:else if todaysCalories === undefined}
						<Spinner />
					{:else}
						{todaysCalories} kcal
					{/if}
				</p>
			</div>
		</div>
	{:else if data === undefined}
		<p class="flex items-center gap-2">
			{m['foodDiary.activityGoal.healthChecking']()}
			<Spinner />
		</p>
	{/if}
</div>
