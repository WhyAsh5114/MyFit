<script lang="ts">
	import MacroMetricsForm from './macro-metrics-form.svelte';
	import { useGetCurrentUserQuery } from '$lib/features/user/get-current-user';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { useGetMacroMetricsQuery } from '$lib/features/food-diary/macro-metrics/get-macro-metrics';
	import { Spinner } from '$lib/components/ui/spinner';
	import { useCreateMacroMetricsMutation } from '$lib/features/food-diary/macro-metrics/create-macro-metrics';
	import { m } from '$lib/paraglide/messages';
	import { SaveIcon } from '@lucide/svelte';
	import type { MacroTrackingMetricsSchema } from '$lib/features/food-diary/macro-metrics/macro-metrics.schema';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const getCurrentUserQuery = useGetCurrentUserQuery();
	const getMacroMetricsQuery = useGetMacroMetricsQuery(() => getCurrentUserQuery.data?.id ?? '');

	const createMacroMetricsMutation = useCreateMacroMetricsMutation();

	async function handleSubmit(data: MacroTrackingMetricsSchema) {
		if (!getCurrentUserQuery.data) {
			return toast.error(m['unknownErrorOccurred']());
		}
		await createMacroMetricsMutation.mutateAsync({ ...data, userId: getCurrentUserQuery.data.id });
		toast.success(m['foodDiary.metrics.saved']());
		await goto(resolve('/food-diary/goals'));
	}
</script>

{#if !getCurrentUserQuery.data || getMacroMetricsQuery.data === undefined}
	<Skeleton class="h-67.5 w-full" />
	<Skeleton class="h-27 w-full" />
	<Skeleton class="mt-auto h-9 w-full" />
{:else}
	<MacroMetricsForm
		initialData={getMacroMetricsQuery.data}
		formId="macro-tracking-metrics-form"
		onSubmit={handleSubmit}
	>
		{#snippet submit()}
			<Button class="mt-auto w-full" type="submit" disabled={createMacroMetricsMutation.isPending}>
				{#if createMacroMetricsMutation.isPending}
					<Spinner />
				{:else}
					{m['foodDiary.metrics.save']()}
					<SaveIcon />
				{/if}
			</Button>
		{/snippet}
	</MacroMetricsForm>
{/if}
