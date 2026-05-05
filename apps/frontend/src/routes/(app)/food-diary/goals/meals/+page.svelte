<script lang="ts">
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import MacroMealsForm from './macro-meals-form.svelte';
	import { useMeals } from '$lib/features/food-diary/meals/queries/get';
	import { useSaveMeals } from '$lib/features/food-diary/meals/mutations/save';
	import { m } from '$lib/paraglide/messages';
	import { SaveIcon } from '@lucide/svelte';
	import type { MealsFormSchema } from '$lib/features/food-diary/meals/schema';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Spinner } from '$lib/components/ui/spinner';

	const currentUser = useCurrentUser();
	const meals = useMeals(() => currentUser.data?.id ?? '');
	const saveMeals = useSaveMeals();

	async function handleSubmit(data: MealsFormSchema) {
		if (!currentUser.data) return toast.error(m['unknownErrorOccurred']());
		await saveMeals.mutateAsync({ meals: data.meals, userId: currentUser.data.id });
		toast.success('Meals saved');
		await goto(resolve('/food-diary/goals'));
	}
</script>

{#if !currentUser.data || meals.data === undefined}
	<Skeleton class="h-67.5 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else}
	<MacroMealsForm initialData={meals.data} onSubmit={handleSubmit}>
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
