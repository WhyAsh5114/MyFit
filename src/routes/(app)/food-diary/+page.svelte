<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import H1 from '$lib/components/typography/h1.svelte';
	import { client } from '$lib/idb-client';
	import { calculateBMR, stepsToCalories } from '$lib/my-utils';
	import { CalendarDateTime, fromDate, getLocalTimeZone, today } from '@internationalized/date';
	import { CalendarIcon, LoaderCircleIcon } from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { SvelteDate } from 'svelte/reactivity';
	import { healthState } from '../_components/health-state.svelte';
	import ActivityEntryCard from './_components/activity-entry-card.svelte';
	import FoodEntryCard from './_components/food-entry-card.svelte';
	import TopActionCard from './_components/top-action-card.svelte';

	let selectedDay = $state<SvelteDate>();

	const macroDataQuery = createQuery(() => ({
		queryKey: ['macro-data'],
		queryFn: async () => {
			const metrics = await client.macroMetrics.findFirst();
			const targets = await client.macroTargets.findFirst();

			if (!metrics || !targets) return null;

			const bmr = calculateBMR(metrics);
			return {
				caloricTarget: bmr + targets.caloricChange / 7,
				metrics,
				targets
			};
		}
	}));

	const entriesQuery = createQuery(() => ({
		queryKey: ['entries', selectedDay?.toDateString()],
		queryFn: async () => {
			if (!selectedDay) return { activityEntries: [], foodEntries: [] };

			const calDate = fromDate(selectedDay, getLocalTimeZone());

			const start = new CalendarDateTime(calDate.year, calDate.month, calDate.day, 0, 0, 0, 0);
			const end = new CalendarDateTime(calDate.year, calDate.month, calDate.day, 23, 59, 59, 999);

			const startDate = start.toDate(getLocalTimeZone());
			const endDate = end.toDate(getLocalTimeZone());

			const [activityEntries, foodEntries] = await Promise.all([
				client.activityEntry.findMany({
					where: { performedAt: { gte: startDate, lt: endDate } },
					orderBy: { performedAt: 'asc' }
				}),
				client.foodEntry.findMany({
					where: { eatenAt: { gte: startDate, lt: endDate } },
					include: { nutritionData: true },
					orderBy: { eatenAt: 'asc' }
				})
			]);

			return { activityEntries, foodEntries };
		},
		enabled: Boolean(selectedDay)
	}));

	createQuery(() => ({
		queryKey: ['active-calories-burned', selectedDay?.toDateString()],
		queryFn: async () => {
			if (!selectedDay) return null;
			const currentDay = new Date(selectedDay);
			const activityTrackingPreferences = await client.macroActivityTrackingPreferences.findFirst();
			if (!activityTrackingPreferences) return null;

			const existingSystemEntry = await client.activityEntry.findFirst({
				where: {
					performedAt: {
						gte: new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate()),
						lte: new Date(
							currentDay.getFullYear(),
							currentDay.getMonth(),
							currentDay.getDate(),
							23,
							59,
							59,
							999
						)
					},
					userId: activityTrackingPreferences.userId,
					systemGenerated: true
				}
			});

			if (activityTrackingPreferences.adjustmentType === 'Static') {
				if (!activityTrackingPreferences.staticCalories) return null;
				const activityEntryData = {
					calories: activityTrackingPreferences.staticCalories,
					performedAt: currentDay,
					quantity: activityTrackingPreferences.staticCalories,
					quantityUnit: 'calories',
					systemGenerated: true,
					userId: activityTrackingPreferences.userId
				};
				await client.activityEntry.upsert({
					where: { id: existingSystemEntry?.id },
					create: activityEntryData,
					update: activityEntryData
				});
				await entriesQuery.refetch();
				return activityEntryData.calories;
			}

			if (activityTrackingPreferences.adjustmentType === 'Dynamic') {
				const stepsForDay = await healthState.getStepsForDay(currentDay);
				if (stepsForDay === null) {
					toast.error('Device sync failed');
					return null;
				}

				const userMetrics = await client.macroMetrics.findFirst();
				if (!userMetrics) return null;

				const activityEntryData = {
					calories: stepsToCalories(stepsForDay, userMetrics),
					performedAt: currentDay,
					quantity: stepsForDay,
					quantityUnit: 'steps',
					systemGenerated: true,
					userId: activityTrackingPreferences.userId
				};

				await client.activityEntry.upsert({
					where: { id: existingSystemEntry?.id },
					create: activityEntryData,
					update: activityEntryData
				});
				await entriesQuery.refetch();
				return activityEntryData.calories;
			}
		},
		enabled: Boolean(selectedDay)
	}));

	let caloricIntake = $derived(
		entriesQuery.data?.foodEntries.reduce(
			(sum, entry) => sum + (entry.nutritionData?.energy_kcal_100g || 0) * (entry.quantity / 100),
			0
		) || 0
	);

	let caloricExpenditure = $derived(
		entriesQuery.data?.activityEntries.reduce((sum, entry) => sum + entry.calories, 0) || 0
	);

	$effect(() => {
		const urlDay = page.url.searchParams.get('day');
		if (urlDay) {
			const parsedDate = new Date(urlDay);
			if (!isNaN(parsedDate.getTime())) {
				selectedDay = new SvelteDate(parsedDate);
				return;
			}
		}

		if (!selectedDay) {
			const calToday = today(getLocalTimeZone());
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`/food-diary?day=${calToday.toString()}`);
			selectedDay = new SvelteDate(calToday.toDate(getLocalTimeZone()));
		}
	});
</script>

<H1>Food diary</H1>

<TopActionCard {caloricExpenditure} {caloricIntake} macroData={macroDataQuery.data} {selectedDay} />

{#if !entriesQuery.data}
	<div class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
		<LoaderCircleIcon size={128} strokeWidth={1} class="animate-spin" />
		<span>Loading</span>
	</div>
{:else}
	{#each entriesQuery.data.activityEntries as entry (entry.id)}
		<ActivityEntryCard {entry} />
	{/each}
	{#each entriesQuery.data.foodEntries as entry (entry.id)}
		<FoodEntryCard {entry} {entriesQuery} />
	{:else}
		<div class="h-full flex flex-col justify-center items-center gap-2 text-muted-foreground">
			<CalendarIcon size={128} strokeWidth={1} />
			<span>No food entries for this day</span>
		</div>
	{/each}
{/if}
