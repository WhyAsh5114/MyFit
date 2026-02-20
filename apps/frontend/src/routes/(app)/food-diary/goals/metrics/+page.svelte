<script lang="ts">
	import MacroMetricsForm from './macro-metrics-form.svelte';
	import { useCurrentUser } from '$lib/features/user/queries/get-current-user';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { useMacroMetrics } from '$lib/features/food-diary/macro-metrics/queries/get';
	import { Spinner } from '$lib/components/ui/spinner';
	import { useCreateMacroMetrics } from '$lib/features/food-diary/macro-metrics/mutations/create';
	import { m } from '$lib/paraglide/messages';
	import { SaveIcon } from '@lucide/svelte';
	import type { MacroTrackingMetricsSchema } from '$lib/features/food-diary/macro-metrics/schema';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const currentUser = useCurrentUser();
	const macroMetrics = useMacroMetrics(() => currentUser.data?.id ?? '');

	const createMacroMetrics = useCreateMacroMetrics();

	async function handleSubmit(data: MacroTrackingMetricsSchema) {
		if (!currentUser.data) {
			return toast.error(m['unknownErrorOccurred']());
		}
		await createMacroMetrics.mutateAsync({ ...data, userId: currentUser.data.id });
		toast.success(m['foodDiary.metrics.saved']());
		await goto(resolve('/food-diary/goals'));
	}
</script>

{#if !currentUser.data || macroMetrics.data === undefined}
	<Skeleton class="h-67.5 w-full" />
	<Skeleton class="h-27 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else}
	<MacroMetricsForm
		initialData={macroMetrics.data}
		formId="macro-tracking-metrics-form"
		onSubmit={handleSubmit}
	>
		{#snippet submit()}
			<Button class="mt-auto w-full" type="submit" disabled={createMacroMetrics.isPending}>
				{#if createMacroMetrics.isPending}
					<Spinner />
				{:else}
					{m['foodDiary.metrics.save']()}
					<SaveIcon />
				{/if}
			</Button>
		{/snippet}
	</MacroMetricsForm>
{/if}
