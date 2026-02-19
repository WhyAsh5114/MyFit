<script lang="ts">
	import { page } from '$app/state';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { useGetNutritionDataByIdQuery } from '$lib/features/food-diary/nutrition-data/get-nutrition-data-by-id';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import {
		CircleCheckBigIcon,
		PlusCircleIcon,
		ScanBarcodeIcon,
		SearchIcon,
		SearchXIcon
	} from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import FoodEntryForm from '../../components/add-edit-entries/food-entry-form.svelte';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { toast } from 'svelte-sonner';
	import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
	import { useCreateFoodEntryMutation } from '$lib/features/food-diary/food-entry/create-food-entry';
	import { goto } from '$app/navigation';
	import { Spinner } from '$lib/components/ui/spinner';
	import { nutritionDataToFoodEntryFormData } from '$lib/features/food-diary/nutrition-data/nutrition-data.mapper';

	const getCurrentUserQuery = useGetCurrentUserQuery();
	const getNutritionDataByIdQuery = useGetNutritionDataByIdQuery(() => page.params.id ?? '');

	const createFoodEntryMutation = useCreateFoodEntryMutation();

	async function handleSubmit(data: FoodEntryFormSchema) {
		if (!getCurrentUserQuery.data) {
			toast.error(m['unknownErrorOccurred']());
			return;
		}
		await createFoodEntryMutation.mutateAsync({
			data,
			userId: getCurrentUserQuery.data.id
		});
		toast.success(m['foodDiary.foodEntryCreated']());
		await goto(resolve(`/food-diary/${page.params.date}`));
	}
</script>

{#if getNutritionDataByIdQuery.data === undefined || !getCurrentUserQuery.data}
	<Skeleton class="h-70 w-full" />
	<Skeleton class="h-65 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else if getNutritionDataByIdQuery.data === null}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<SearchXIcon />
			</Empty.Media>
			<Empty.Title>{m['foodDiary.noFoodFound']()}</Empty.Title>
			<Empty.Description>
				{m['foodDiary.noFoodFoundDescription']()}
			</Empty.Description>
		</Empty.Header>
		<Empty.Content class="grid gap-2">
			<Button href={resolve(`/food-diary/${page.params.date}/add/scan`)}>
				<ScanBarcodeIcon />
				{m['foodDiary.scanBarcode']()}
			</Button>
			<Button variant="secondary" href={resolve(`/food-diary/${page.params.date}/add`)}>
				<SearchIcon />
				{m['foodDiary.searchForFoods']()}
			</Button>
			<Button variant="outline">
				<PlusCircleIcon />
				{m['foodDiary.addManually']()}
			</Button>
		</Empty.Content>
	</Empty.Root>
{:else}
	<FoodEntryForm
		initialData={nutritionDataToFoodEntryFormData(getNutritionDataByIdQuery.data, page.params.date)}
		allowProductEdit={false}
		formId="create-food-entry-form"
		onSubmit={handleSubmit}
	>
		{#snippet submit()}
			<Button
				type="submit"
				class="mt-auto"
				form="create-food-entry-form"
				disabled={createFoodEntryMutation.isPending}
			>
				{#if createFoodEntryMutation.isPending}
					<Spinner />
				{:else}
					Log food
					<CircleCheckBigIcon />
				{/if}
			</Button>
		{/snippet}
	</FoodEntryForm>
{/if}
