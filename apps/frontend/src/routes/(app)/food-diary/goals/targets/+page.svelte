<script lang="ts">
	import { markRecentChange } from '#lib/features/recent-change.svelte.js';
	import { useCurrentUser } from '#lib/features/user/queries/get-current-user.js';
	import Skeleton from '#lib/components/ui/skeleton/skeleton.svelte';
	import MacroTargetsForm from './macro-targets-form.svelte';
	import { useMacroTargets } from '#lib/features/food-diary/macro-targets/queries/get.js';
	import { useCreateMacroTargets } from '#lib/features/food-diary/macro-targets/mutations/create.js';
	import { m } from '#lib/paraglide/messages.js';
	import { SaveIcon } from '@lucide/svelte';
	import type { MacroTargetsSchema } from '#lib/features/food-diary/macro-targets/schema.js';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Spinner } from '#lib/components/ui/spinner/index.js';

	const currentUser = useCurrentUser();
	const macroTargets = useMacroTargets(() => currentUser.data?.id ?? '');

	const createMacroTargets = useCreateMacroTargets();

	async function handleSubmit(data: MacroTargetsSchema) {
		if (!currentUser.data) {
			return toast.error(m['unknownErrorOccurred']());
		}
		await createMacroTargets.mutateAsync({ ...data, userId: currentUser.data.id });
		markRecentChange('targets');
		await goto(resolve('food-diary/goals'));
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
