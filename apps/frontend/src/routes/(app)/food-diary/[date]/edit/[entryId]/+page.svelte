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
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { useFoodEntryById } from '$lib/features/food-diary/food-entry/queries/get-by-id';
	import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/model/schema';
	import { useUpdateFoodEntry } from '$lib/features/food-diary/food-entry/mutations/update';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import FoodEntryForm from '../../components/add-edit-entries/food-entry-form.svelte';
	import { foodEntryToFoodEntryFormSchema } from '$lib/features/food-diary/food-entry/model/mapper';

	const currentUser = useCurrentUser();
	const foodEntryById = useFoodEntryById(() => ({
		userId: currentUser.data?.id ?? '',
		id: page.params.entryId ?? ''
	}));

	const updateFoodEntry = useUpdateFoodEntry();

	async function handleSubmit(data: FoodEntryFormSchema) {
		if (!page.params.entryId || !currentUser.data) {
			toast.error(m['unknownErrorOccurred']());
			return;
		}
		await updateFoodEntry.mutateAsync({
			data,
			id: page.params.entryId,
			userId: currentUser.data.id
		});
		toast.success(m['foodDiary.foodEntryUpdated']());
		await goto(resolve(`/food-diary/${page.params.date}`));
	}
</script>

{#if foodEntryById.data === undefined || !currentUser.data}
	<Skeleton class="h-70 w-full" />
	<Skeleton class="h-65 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else if foodEntryById.data === null}
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
		initialData={foodEntryToFoodEntryFormSchema(foodEntryById.data, page.params.date)}
		allowProductEdit
		formId="edit-food-entry-form"
		onSubmit={handleSubmit}
		meals={currentUser.data.foodDiaryMeals}
	>
		{#snippet submit()}
			<Button
				type="submit"
				form="edit-food-entry-form"
				class="mt-auto"
				disabled={updateFoodEntry.isPending}
			>
				{#if updateFoodEntry.isPending}
					<Spinner />
				{:else}
					Update entry
					<SquarePenIcon />
				{/if}
			</Button>
		{/snippet}
	</FoodEntryForm>
{/if}
