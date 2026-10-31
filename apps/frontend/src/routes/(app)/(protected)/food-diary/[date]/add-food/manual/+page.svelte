<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { useCreateFoodEntry } from '#lib/features/food-diary/food-entry/mutations/create.js';
	import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
	import { CircleCheckBigIcon } from '@lucide/svelte';
	import posthog from 'posthog-js';
	import { markRecentChange } from '#lib/features/recent-change.svelte.js';
	import FoodEntryForm from '../../components/add-edit-entries/food-entry-form.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const createFoodEntry = useCreateFoodEntry();

	async function handleSubmit(form: FoodEntryFormSchema) {
		const created = await createFoodEntry.mutateAsync({
			data: form,
			userId: data.ownerId
		});
		posthog.capture('food_entry_created', {
			source: 'manual',
			product_name: form.productName,
			quantity_g: form.quantityG
		});
		markRecentChange(created.id);
		await goto(resolve(`food-diary/${page.params.date}`));
	}
</script>

<FoodEntryForm
	allowProductEdit
	formId="create-food-entry-form"
	onSubmit={handleSubmit}
	meals={data.meals}
>
	{#snippet submit()}
		<Button
			type="submit"
			form="create-food-entry-form"
			class="mt-auto"
			disabled={createFoodEntry.isPending}
		>
			{#if createFoodEntry.isPending}
				<Spinner />
			{:else}
				Log food
				<CircleCheckBigIcon />
			{/if}
		</Button>
	{/snippet}
</FoodEntryForm>
