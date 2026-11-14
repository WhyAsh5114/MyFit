<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import posthog from 'posthog-js';
	import { toast } from 'svelte-sonner';
	import { m } from '#lib/paraglide/messages.js';
	import { foodDetail } from './food-detail.js';
	import { mealForTime, usualMealAt } from '#lib/domain/food-history/rank.js';
	import { momentOnDay } from '#lib/features/food-diary/_common/day-bounds.js';
	import { markRecentChange } from '#lib/features/food-diary/_common/recent-change.svelte.js';
	import { useCreateFoodEntry } from '#lib/features/food-diary/food-entry/mutations/create.js';
	import { foodEntryToRepeatFormData } from '#lib/features/food-diary/food-entry/model/mapper.js';
	import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
	import FoodRow from './food-row.svelte';
	import type { PageData } from './$types';

	type History = PageData['history'];
	type HistoryFood = History['foods'][number];

	type Props = {
		foods: HistoryFood[];
		mealTimes: History['mealTimes'];
		meals: PageData['meals'];
		/** The meal filter's meal, which wins over the time of day. */
		mealFilterId: string | null;
		/** The page's search params, carried to the food's page. */
		params: SvelteURLSearchParams;
		date: string | undefined;
		ownerId: string;
	};
	let { foods, mealTimes, meals, mealFilterId, params, date, ownerId }: Props = $props();

	const activeMealIds = $derived(new Set(meals.map((meal) => meal.id)));

	/**
	 * The meal filter's meal, else the meal the user usually logs at this time of day, else the meal
	 * this food was logged in nearest this time of day.
	 */
	const mealFor = (food: HistoryFood) => {
		if (mealFilterId) return mealFilterId;
		const now = momentOnDay(date);
		return usualMealAt(mealTimes, activeMealIds, now) ?? mealForTime(food, activeMealIds, now);
	};

	const historyHref = (food: HistoryFood) => {
		const query = new SvelteURLSearchParams(params);
		const mealId = mealFor(food);
		if (mealId) query.set('meal-id', mealId);
		return resolve(`food-diary/${date}/add-food/history/${food.latest.id}?${query.toString()}`);
	};

	const createFoodEntry = useCreateFoodEntry();
	let loggingKey = $state<string | null>(null);

	/** Log a food from your history again at its last amount, and show it on the diary. */
	async function logAgain(food: HistoryFood) {
		let form: FoodEntryFormSchema;
		try {
			form = foodEntryToRepeatFormData(food.latest, date, mealFor(food));
		} catch (error) {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to repeat food entry:', error);
			return;
		}
		loggingKey = food.key;
		try {
			const created = await createFoodEntry.mutateAsync({ data: form, userId: ownerId });
			posthog.capture('food_entry_created', {
				source: 'history',
				product_name: form.productName,
				quantity_g: form.quantityG
			});
			markRecentChange(created.id);
			await goto(resolve(`food-diary/${date}`));
		} catch {
			// The mutation's onError has already told the user.
		} finally {
			loggingKey = null;
		}
	}
</script>

<h2 class="text-sm font-medium text-muted-foreground">{m['foodDiary.yourFoods']()}</h2>
{#each foods as food (food.key)}
	<FoodRow
		name={food.latest.productName}
		detail={foodDetail(food.latest)}
		href={historyHref(food)}
		action={{
			label: m['foodDiary.logAgain']({ name: food.latest.productName }),
			onclick: () => void logAgain(food)
		}}
		pending={loggingKey === food.key}
		disabled={createFoodEntry.isPending}
	/>
{/each}
