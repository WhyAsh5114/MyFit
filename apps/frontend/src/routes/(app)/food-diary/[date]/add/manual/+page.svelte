<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import { useCreateFoodEntryMutation } from '$lib/features/food-diary/food-entry/create-food-entry';
	import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/food-entry.schema';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';
	import { m } from '$lib/paraglide/messages';
	import { CircleCheckBigIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import FoodEntryForm from '../../components/add-edit-entries/food-entry-form.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const getCurrentUserQuery = useGetCurrentUserQuery();
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

{#if !getCurrentUserQuery.data}
	<Skeleton class="h-70 w-full" />
	<Skeleton class="h-65 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else}
	<FoodEntryForm
		allowProductEdit
		formId="create-food-entry-form"
		date={page.params.date}
		onSubmit={handleSubmit}
	>
		{#snippet submit()}
			<Button
				type="submit"
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
