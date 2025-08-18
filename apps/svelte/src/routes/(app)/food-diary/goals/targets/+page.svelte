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
	import type { MacroTrackingTargetsSchema } from './_components/targets-form-schema';
	import TargetsForm from './_components/targets-form.svelte';

	let formData = $state(writable<MacroTrackingTargetsSchema>());

	async function loadExistingTargets() {
		const existingTargets = await client.macroTargets.findFirst();
		if (existingTargets) $formData = existingTargets;
	}

	$effect(() => {
		loadExistingTargets();
	});

	const saveTargets = createMutation(() => ({
		mutationFn: async (data: MacroTrackingTargetsSchema) => {
			const user = await client.user.findFirstOrThrow();
			const existingTargets = await client.macroTargets.findFirst();

			await client.macroTargets.upsert({
				where: { id: existingTargets?.id },
				create: { ...data, userId: user.id },
				update: { ...data }
			});
		},
		onSuccess: () => {
			toast.success('Targets saved successfully');
		},
		onError: (err) => {
			toast.error('Failed to save targets');
			console.error('Error saving targets:', err);
		}
	}));
</script>

<H1>Food diary</H1>
<H2>Goals</H2>
<H3>Targets</H3>

<TargetsForm
	bind:formData
	onUpdate={({ form }) => {
		if (!form.valid) {
			toast.error('Error saving targets', { description: form.errors._errors?.join(', ') });
			return;
		}
		saveTargets.mutate(form.data);
	}}
/>

<Button class="mt-auto" form="targets-form" type="submit" disabled={saveTargets.isPending}>
	{#if saveTargets.isPending}
		<LoaderCircleIcon class="animate-spin" />
	{:else}
		<SaveIcon /> Save
	{/if}
</Button>
