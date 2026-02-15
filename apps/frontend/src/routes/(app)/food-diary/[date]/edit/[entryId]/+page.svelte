<script lang="ts">
	import { page } from '$app/state';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import {
		PlusCircleIcon,
		ScanBarcodeIcon,
		SearchIcon,
		SearchXIcon,
		SquarePenIcon
	} from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { useGetFoodEntryByIdQuery } from '$lib/features/food-diary/food-entry/get-food-entry-by-id';
	import { foodEntryToFoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.mapper';
	import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
	import { useUpdateFoodEntryMutation } from '$lib/features/food-diary/food-entry/update-food-entry';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import FoodEntryForm from '../../components/add-edit-entries/food-entry-form.svelte';

	const getCurrentUserQuery = useGetCurrentUserQuery();
	const getFoodEntryByIdQuery = useGetFoodEntryByIdQuery(() => page.params.entryId ?? '');

	const updateFoodEntryMutation = useUpdateFoodEntryMutation();

	async function handleSubmit(data: FoodEntryFormSchema) {
		if (!page.params.entryId || !getCurrentUserQuery.data) {
			toast.error(m['unknownErrorOccurred']());
			return;
		}
		await updateFoodEntryMutation.mutateAsync({
			data,
			id: page.params.entryId,
			userId: getCurrentUserQuery.data.id
		});
		toast.success(m['foodDiary.foodEntryUpdated']());
		await goto(resolve(`/food-diary/${page.params.date}`));
	}
</script>

{#if getFoodEntryByIdQuery.data === undefined || !getCurrentUserQuery.data}
	<Skeleton class="h-70 w-full" />
	<Skeleton class="h-65 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else if getFoodEntryByIdQuery.data === null}
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
		initialData={foodEntryToFoodEntryFormSchema(getFoodEntryByIdQuery.data)}
		allowProductEdit
		formId="edit-food-entry-form"
		date={page.params.date}
		onSubmit={handleSubmit}
	>
		{#snippet submit()}
			<Button
				type="submit"
				form="edit-food-entry-form"
				class="mt-auto"
				disabled={updateFoodEntryMutation.isPending}
			>
				{#if updateFoodEntryMutation.isPending}
					<Spinner />
				{:else}
					Update entry
					<SquarePenIcon />
				{/if}
			</Button>
		{/snippet}
	</FoodEntryForm>
{/if}
