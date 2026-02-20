<script lang="ts">
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import MacroTargetsForm from './macro-targets-form.svelte';
	import { useMacroTargets } from '$lib/features/food-diary/macro-targets/queries/get';
	import { useCreateMacroTargets } from '$lib/features/food-diary/macro-targets/mutations/create';
	import { m } from '$lib/paraglide/messages';
	import { SaveIcon } from '@lucide/svelte';
	import type { MacroTargetsSchema } from '$lib/features/food-diary/macro-targets/schema';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Spinner } from '$lib/components/ui/spinner';

	const currentUser = useCurrentUser();
	const macroTargets = useMacroTargets(() => currentUser.data?.id ?? '');

	const createMacroTargets = useCreateMacroTargets();

	async function handleSubmit(data: MacroTargetsSchema) {
		if (!currentUser.data) {
			return toast.error('Unable to save targets - user not found');
		}
		await createMacroTargets.mutateAsync({ ...data, userId: currentUser.data.id });
		toast.success('Targets saved');
		await goto(resolve('/food-diary/goals'));
	}
</script>

{#if !currentUser.data || macroTargets.data === undefined}
	<Skeleton class="h-67.5 w-full" />
	<Skeleton class="h-27 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else}
	<MacroTargetsForm
		initialData={macroTargets.data}
		formId="macro-targets-form"
		onSubmit={handleSubmit}
	>
		{#snippet submit()}
			<Button class="mt-auto w-full" type="submit" disabled={createMacroTargets.isPending}>
				{#if createMacroTargets.isPending}
					<Spinner />
				{:else}
					{m['foodDiary.metrics.save']()}
					<SaveIcon />
				{/if}
			</Button>
		{/snippet}
	</MacroTargetsForm>
{/if}
