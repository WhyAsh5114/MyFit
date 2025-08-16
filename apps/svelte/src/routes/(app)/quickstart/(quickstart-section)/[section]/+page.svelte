<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import H3 from '$lib/components/typography/h3.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { ChevronRightIcon, XCircleIcon } from '@lucide/svelte';
	import { selectedStepsState } from '../selected-steps.svelte';

	let stepRoutes = $state(
		page.data.stepRoutesMap
			? page.data.stepRoutesMap[page.url.pathname].map((stepRoute) => ({
					...stepRoute,
					checked: stepRoute.metadata['required'] === 'true'
				}))
			: []
	);

	function saveCustomizationRoutes() {
		const customizationRoutes = stepRoutes
			.filter((stepRoute) => stepRoute.checked)
			.map((stepRoute) => stepRoute.href);

		selectedStepsState.selectedSteps = customizationRoutes;
		goto(customizationRoutes[0]);
	}
</script>

<H3>What all do you wanna customize?</H3>
<div class="flex grow flex-col gap-2">
	{#each stepRoutes as stepRoute, i (stepRoute.label)}
		<Label class="bg-card flex items-center gap-4 rounded-md border p-2">
			<Checkbox
				disabled={stepRoute.metadata['required'] === 'true'}
				bind:checked={stepRoutes[i].checked}
			/>
			<div class="flex flex-col">
				<span class="text-base font-semibold">{stepRoute.label}</span>
				<p class="text-muted-foreground text-sm font-normal">{stepRoute.metadata['description']}</p>
			</div>
		</Label>
	{/each}
</div>

<div class="mt-2 grid grid-cols-2 gap-2">
	<Button variant="secondary" href="/dashboard"><XCircleIcon /> Cancel</Button>
	<Button onclick={saveCustomizationRoutes}>Next <ChevronRightIcon /></Button>
</div>
