<script lang="ts">
	import { markRecentChange } from '#lib/features/recent-change.svelte.js';
	import MacroMealsForm from './macro-meals-form.svelte';
	import { useSaveMeals } from '#lib/features/food-diary/meals/mutations/save.js';
	import { m } from '#lib/paraglide/messages.js';
	import { SaveIcon } from '@lucide/svelte';
	import type { MealsFormSchema } from '#lib/features/food-diary/meals/schema.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const saveMeals = useSaveMeals();

	async function handleSubmit(form: MealsFormSchema) {
		if (!data.goals) return;
		await saveMeals.mutateAsync({ meals: form.meals, userId: data.goals.userId });
		markRecentChange('meals');
		await goto(resolve('food-diary/goals'));
	}
</script>

{#if data.goals}
	<MacroMealsForm initialData={data.goals.meals} onSubmit={handleSubmit}>
		{#snippet submit()}
			<Button class="mt-auto w-full" type="submit" disabled={saveMeals.isPending}>
				{#if saveMeals.isPending}
					<Spinner />
				{:else}
					{m['foodDiary.metrics.save']()}
					<SaveIcon />
				{/if}
			</Button>
		{/snippet}
	</MacroMealsForm>
{/if}
