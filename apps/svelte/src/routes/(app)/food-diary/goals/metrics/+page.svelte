<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import H3 from '$lib/components/typography/h3.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { client } from '$lib/idb-client';
	import { LoaderCircleIcon, SaveIcon } from '@lucide/svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';
	import type { SuperFormData } from 'sveltekit-superforms/client';
	import type { MacroTrackingMetricsSchema } from './_components/metrics-form-schema';
	import MetricsForm from './_components/metrics-form.svelte';

	let formData: SuperFormData<MacroTrackingMetricsSchema> =
		$state(writable<MacroTrackingMetricsSchema>());

	async function loadExistingMetrics() {
		const existingMetrics = await client.macroMetrics.findFirst();
		if (existingMetrics) $formData = existingMetrics;
	}

	$effect(() => {
		loadExistingMetrics();
	});

	const saveMetrics = createMutation(() => ({
		mutationFn: async (data: MacroTrackingMetricsSchema) => {
			const user = await client.user.findFirstOrThrow();
			const existingMetrics = await client.macroMetrics.findFirst();

			await client.macroMetrics.upsert({
				where: { id: existingMetrics?.id },
				create: { ...data, userId: user.id },
				update: { ...data }
			});
		},
		onSuccess: () => {
			toast.success('Metrics saved successfully');
		},
		onError: (err) => {
			toast.error('Failed to save metrics');
			console.error('Error saving metrics:', err);
		}
	}));
</script>

<H1>Food diary</H1>
<H2>Goals</H2>
<H3>Metrics</H3>

<MetricsForm
	bind:formData
	onUpdate={({ form }) => {
		if (!form.valid) return;
		saveMetrics.mutate(form.data);
	}}
/>

<Button
	type="submit"
	form="macro-tracking-metrics-form"
	class="mt-auto"
	disabled={saveMetrics.isPending}
>
	{#if saveMetrics.isPending}
		<LoaderCircleIcon class="animate-spin" /> Saving
	{:else}
		Save <SaveIcon />
	{/if}
</Button>
