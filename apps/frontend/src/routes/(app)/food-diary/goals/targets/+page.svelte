<script lang="ts">
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import MacroTargetsForm from './macro-targets-form.svelte';
	import { useGetMacroTargetsQuery } from '$lib/features/food-diary/macro-targets/get-macro-targets';
	import { useCreateMacroTargetsMutation } from '$lib/features/food-diary/macro-targets/create-macro-targets';
	import { m } from '$lib/paraglide/messages';
	import { SaveIcon } from '@lucide/svelte';
	import type { MacroTargetsSchema } from '$lib/features/food-diary/macro-targets/macro-targets.schema';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Spinner } from '$lib/components/ui/spinner';

	const getCurrentUserQuery = useGetCurrentUserQuery();
	const getMacroTargetsQuery = useGetMacroTargetsQuery(() => getCurrentUserQuery.data?.id ?? '');

	const createMacroTargetsMutation = useCreateMacroTargetsMutation();

	async function handleSubmit(data: MacroTargetsSchema) {
		if (!getCurrentUserQuery.data) {
			return toast.error('Unable to save targets - user not found');
		}
		await createMacroTargetsMutation.mutateAsync({ ...data, userId: getCurrentUserQuery.data.id });
		toast.success('Targets saved');
		await goto(resolve('/food-diary/goals'));
	}
</script>

{#if !getCurrentUserQuery.data || getMacroTargetsQuery.data === undefined}
	<Skeleton class="h-67.5 w-full" />
	<Skeleton class="h-27 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else}
	<MacroTargetsForm
		initialData={getMacroTargetsQuery.data}
		formId="macro-targets-form"
		onSubmit={handleSubmit}
	>
		{#snippet submit()}
			<Button class="mt-auto w-full" type="submit" disabled={createMacroTargetsMutation.isPending}>
				{#if createMacroTargetsMutation.isPending}
					<Spinner />
				{:else}
					{m['foodDiary.metrics.save']()}
					<SaveIcon />
				{/if}
			</Button>
		{/snippet}
	</MacroTargetsForm>
{/if}
