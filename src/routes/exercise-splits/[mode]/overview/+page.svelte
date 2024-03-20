<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Card } from '$lib/components/ui/card';

	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';
	import { editingExerciseSplitIdStore, exerciseSplitStore } from '../exerciseSplitStore';
	import PerMuscleGroupComponent from '../../(components)/PerMuscleGroupComponent.svelte';
	import PerDayChartComponent from '../../(components)/PerDayChartComponent.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let callingEndpoint = false;

	async function callEndpoint() {
		let fetchURL = '/api/exercise-splits';
		if ($page.params.mode === 'edit') fetchURL += `/${$editingExerciseSplitIdStore}`;

		callingEndpoint = true;
		const response = await fetch(fetchURL, {
			method: $page.params.mode === 'new' ? 'POST' : 'PUT',
			body: JSON.stringify($exerciseSplitStore)
		});
		if (response.ok) {
			toast.success('Success', { description: await response.text() });
			goto('/exercise-splits');
			$exerciseSplitStore = {
				name: '',
				splitDays: Array.from({ length: 7 }).map(() => {
					return { name: '', exerciseTemplates: [] };
				})
			};
		} else toast.error(`Error ${response.status}`, { description: await response.text() });
		callingEndpoint = false;
	}
</script>

<H3>Overview</H3>

<Tabs.Root value="Per muscle group" class="mb-auto w-full">
	<Tabs.List class="grid grid-cols-2">
		<Tabs.Trigger value="Per muscle group">Per muscle group</Tabs.Trigger>
		<Tabs.Trigger value="Per day">Per day</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="Per muscle group">
		<Card class="p-2">
			<PerMuscleGroupComponent splitDays={$exerciseSplitStore.splitDays} />
		</Card>
	</Tabs.Content>
	<Tabs.Content value="Per day">
		<Card class="p-2">
			<PerDayChartComponent splitDays={$exerciseSplitStore.splitDays} />
		</Card>
	</Tabs.Content>
</Tabs.Root>

<div class="grid grid-cols-2 gap-1">
	<Button variant="secondary">
		<a href="./exercises" class="w-full">Back</a>
	</Button>
	<Button on:click={callEndpoint} disabled={callingEndpoint}>
		{#if callingEndpoint}
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{/if}
		Save
	</Button>
</div>
