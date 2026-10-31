<script lang="ts">
	import { page } from '$app/state';
	import Skeleton from '#lib/components/ui/skeleton/skeleton.svelte';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import {
		PlusCircleIcon,
		ScanBarcodeIcon,
		SearchIcon,
		SearchXIcon,
		SquarePenIcon,
		TrashIcon
	} from '@lucide/svelte';
	import Button from '#lib/components/ui/button/button.svelte';
	import { useCurrentUser } from '#lib/features/user/queries/get-current-user.js';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { useFoodEntryById } from '#lib/features/food-diary/food-entry/queries/get-by-id.js';
	import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
	import { useUpdateFoodEntry } from '#lib/features/food-diary/food-entry/mutations/update.js';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import FoodEntryForm from '../../components/add-edit-entries/food-entry-form.svelte';
	import { foodEntryToFoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/mapper.js';
	import { useDeleteFoodEntry } from '#lib/features/food-diary/food-entry/mutations/delete.js';
	import { useCreateFoodEntry } from '#lib/features/food-diary/food-entry/mutations/create.js';
	import { useMeals } from '#lib/features/food-diary/meals/queries/get.js';
	import posthog from 'posthog-js';
	import { markRecentChange } from '#lib/features/recent-change.svelte.js';
	import type { Row } from '@myfit/shared/client';

	const currentUser = useCurrentUser();
	const meals = useMeals(() => currentUser.data?.id ?? '');
	const foodEntryById = useFoodEntryById(() => ({
		userId: currentUser.data?.id ?? '',
		id: page.params.entryId ?? ''
	}));

	const deleteFoodEntry = useDeleteFoodEntry();
	const createFoodEntry = useCreateFoodEntry();
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
		posthog.capture('food_entry_updated', {
			product_name: data.productName,
			quantity_g: data.quantityG
		});
		markRecentChange(page.params.entryId);
		await goto(resolve(`food-diary/${page.params.date}`));
	}

	/**
	 * Puts the entry back and highlights it on the diary the user has returned to. It is stored as a
	 * new entry, so the old id is left behind.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the id is dropped on purpose
	async function undoDelete({ id, ...entry }: Row<'FoodEntry'>) {
		const restored = await createFoodEntry.mutateAsync({ data: entry, userId: entry.userId });
		posthog.capture('food_entry_restored');
		markRecentChange(restored.id);
	}

	async function deleteEntry() {
		if (!page.params.entryId || !currentUser.data) {
			toast.error(m['unknownErrorOccurred']());
			return;
		}

		const deleted = await deleteFoodEntry.mutateAsync({
			id: page.params.entryId,
			userId: currentUser.data.id
		});
		posthog.capture('food_entry_deleted');
		if (deleted) {
			toast(m['foodDiary.foodEntryDeleted'](), {
				duration: 6000,
				action: { label: m['common.undo'](), onClick: () => void undoDelete(deleted) }
			});
		}
		await goto(resolve(`food-diary/${page.params.date}`));
	}
</script>

{#if foodEntryById.data === undefined || meals.data === undefined || !currentUser.data}
	<Skeleton class="h-134 w-full" />
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
			<Button href={resolve(`food-diary/${page.params.date}/add-food/scan`)}>
				<ScanBarcodeIcon />{m['foodDiary.scanBarcode']()}
			</Button>

			<Button variant="secondary" href={resolve(`food-diary/${page.params.date}/add-food`)}>
				<SearchIcon />{m['foodDiary.searchForFoods']()}
			</Button>

			<Button variant="outline"><PlusCircleIcon />{m['foodDiary.addManually']()}</Button>
		</Empty.Content>
	</Empty.Root>
{:else}
	<FoodEntryForm
		initialData={foodEntryToFoodEntryFormSchema(foodEntryById.data, page.params.date)}
		allowProductEdit
		formId="edit-food-entry-form"
		onSubmit={handleSubmit}
		meals={meals.data}
	>
		{#snippet submit()}
			<div class="mt-auto grid grid-cols-2 gap-2">
				<Button
					type="button"
					disabled={deleteFoodEntry.isPending}
					onclick={deleteEntry}
					variant="destructive"
				>
					{#if deleteFoodEntry.isPending}
						<Spinner />
					{:else}
						<TrashIcon />
						Delete entry
					{/if}
				</Button>
				<Button type="submit" form="edit-food-entry-form" disabled={updateFoodEntry.isPending}>
					{#if updateFoodEntry.isPending}
						<Spinner />
					{:else}
						Update entry
						<SquarePenIcon />
					{/if}
				</Button>
			</div>
		{/snippet}
	</FoodEntryForm>
{/if}
