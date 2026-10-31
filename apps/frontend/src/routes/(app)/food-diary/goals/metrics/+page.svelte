<script lang="ts">
	import { markRecentChange } from '#lib/features/recent-change.svelte.js';
	import MacroMetricsForm from './macro-metrics-form.svelte';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { useCreateMacroMetrics } from '#lib/features/food-diary/macro-metrics/mutations/create.js';
	import { m } from '#lib/paraglide/messages.js';
	import { SaveIcon } from '@lucide/svelte';
	import type { MacroTrackingMetricsSchema } from '#lib/features/food-diary/macro-metrics/schema.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const createMacroMetrics = useCreateMacroMetrics();

	async function handleSubmit(form: MacroTrackingMetricsSchema) {
		if (!data.metrics) return;
		await createMacroMetrics.mutateAsync({ ...form, userId: data.metrics.userId });
		markRecentChange('metrics');
		await goto(resolve('food-diary/goals'));
	}
</script>

{#if data.metrics}
	<MacroMetricsForm
		initialData={data.metrics.macroMetrics}
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
