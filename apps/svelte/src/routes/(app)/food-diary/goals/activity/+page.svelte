<script lang="ts">
	import H1 from '$lib/components/typography/h1.svelte';
	import H2 from '$lib/components/typography/h2.svelte';
	import H3 from '$lib/components/typography/h3.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { client } from '$lib/idb-client';
	import { SaveIcon } from '@lucide/svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';
	import type { SuperFormData } from 'sveltekit-superforms/client';
	import type { MacroTrackingActivitySchema } from './_components/activity-form-schema';
	import ActivityForm from './_components/activity-form.svelte';

	let formData =
		$state<SuperFormData<MacroTrackingActivitySchema>>(writable<MacroTrackingActivitySchema>());

	async function loadExistingActivityPreferences() {
		const existingPreferences = await client.macroActivityTrackingPreferences.findFirst();
		if (existingPreferences) formData.set(existingPreferences);
	}

	$effect(() => {
		loadExistingActivityPreferences();
	});

	const saveActivity = createMutation(() => ({
		mutationFn: async () => {
			const user = await client.user.findFirstOrThrow();
			await client.macroActivityTrackingPreferences.upsert({
				where: { userId: user.id },
				update: { ...$formData },
				create: { userId: user.id, ...$formData }
			});
		},
		onSuccess: () => {
			toast.success('Activity saved successfully!');
		},
		onError: (err) => {
			console.error('Error saving activity:', err);
			toast.error('Failed to save activity');
		}
	}));
</script>

<H1>Food diary</H1>
<H2>Goals</H2>
<H3>Activity</H3>

<ActivityForm
	bind:formData
	onUpdate={({ form }) => {
		if (!form.valid) return;
		saveActivity.mutate();
	}}
/>

<Button class="mt-auto" type="submit" form="activity-form">
	<SaveIcon /> Save
</Button>
