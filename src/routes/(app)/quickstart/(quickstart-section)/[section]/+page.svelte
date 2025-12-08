<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import H3 from '$lib/components/typography/h3.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { ChevronRightIcon, XCircleIcon } from '@lucide/svelte';
	import { selectedStepsState } from '../selected-steps.svelte';
	import * as Card from '$lib/components/ui/card';

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
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(customizationRoutes[0]);
	}
</script>

<H3>What all do you wanna customize?</H3>
<div class="flex grow flex-col gap-2">
	{#each stepRoutes as stepRoute, i (stepRoute.label)}
		<Label>
			<Card.Root class="w-full py-4">
				<Card.Header class="px-4">
					<Card.Title>{stepRoute.label}</Card.Title>
					<Card.Description>{stepRoute.metadata['description']}</Card.Description>
					<Card.Action>
						<Checkbox
							disabled={stepRoute.metadata['required'] === 'true'}
							bind:checked={stepRoutes[i].checked}
						/>
					</Card.Action>
				</Card.Header>
			</Card.Root>
		</Label>
	{/each}
</div>

<div class="mt-2 grid grid-cols-2 gap-2">
	<Button variant="secondary" href="/dashboard"><XCircleIcon /> Cancel</Button>
	<Button onclick={saveCustomizationRoutes}>Next <ChevronRightIcon /></Button>
</div>
