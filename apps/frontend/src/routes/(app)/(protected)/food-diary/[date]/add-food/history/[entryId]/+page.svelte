<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import Button from '#lib/components/ui/button/button.svelte';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { CircleCheckBigIcon, SearchIcon, SearchXIcon } from '@lucide/svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
	import { foodEntryToRepeatFormData } from '#lib/features/food-diary/food-entry/model/mapper.js';
	import { useCreateFoodEntry } from '#lib/features/food-diary/food-entry/mutations/create.js';
	import { markRecentChange } from '#lib/features/food-diary/_common/recent-change.svelte.js';
	import posthog from 'posthog-js';
	import FoodEntryForm from '../../../components/add-edit-entries/food-entry-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const createFoodEntry = useCreateFoodEntry();

	async function handleSubmit(form: FoodEntryFormSchema) {
		const created = await createFoodEntry.mutateAsync({ data: form, userId: data.ownerId });
		posthog.capture('food_entry_created', {
			source: 'history',
			product_name: form.productName,
			quantity_g: form.quantityG
		});
		markRecentChange(created.id);
		await goto(resolve(`food-diary/${page.params.date}`));
	}
</script>

{#if !data.foodEntry}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<SearchXIcon />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.noFoodFound']()}</Empty.Title>
			<Empty.Description>{m['foodDiary.noFoodFoundDescription']()}</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Button variant="secondary" href={resolve(`food-diary/${page.params.date}/add-food`)}>
				<SearchIcon />{m['foodDiary.searchForFoods']()}
			</Button>
		</Empty.Content>
	</Empty.Root>
{:else}
	<FoodEntryForm
		initialData={foodEntryToRepeatFormData(
			data.foodEntry,
			page.params.date,
			page.url.searchParams.get('meal-id')
		)}
		allowProductEdit={false}
		formId="create-food-entry-form"
		onSubmit={handleSubmit}
		meals={data.meals}
	>
		{#snippet submit()}
			<Button
				type="submit"
				class="mt-auto"
				form="create-food-entry-form"
				disabled={createFoodEntry.isPending}
			>
				{#if createFoodEntry.isPending}
					<Spinner />
				{:else}
					{m['foodDiary.logFood']()}
					<CircleCheckBigIcon />
				{/if}
			</Button>
		{/snippet}
	</FoodEntryForm>
{/if}
