<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import { useCreateFoodEntry } from '$lib/features/food-diary/food-entry/mutations/create';
	import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/model/schema';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import { m } from '$lib/paraglide/messages';
	import { CircleCheckBigIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import FoodEntryForm from '../../components/add-edit-entries/food-entry-form.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const currentUser = useCurrentUser();
	const createFoodEntry = useCreateFoodEntry();

	async function handleSubmit(data: FoodEntryFormSchema) {
		if (!currentUser.data) {
			toast.error(m['unknownErrorOccurred']());
			return;
		}
		await createFoodEntry.mutateAsync({
			data,
			userId: currentUser.data.id
		});
		toast.success(m['foodDiary.foodEntryCreated']());
		await goto(resolve(`/food-diary/${page.params.date}`));
	}
</script>

{#if !currentUser.data}
	<Skeleton class="h-70 w-full" />
	<Skeleton class="h-65 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else}
	<FoodEntryForm
		allowProductEdit
		formId="create-food-entry-form"
		onSubmit={handleSubmit}
		meals={currentUser.data.foodDiaryMeals}
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
{/if}
