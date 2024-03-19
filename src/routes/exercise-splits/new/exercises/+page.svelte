<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { exerciseSplitStore } from '../exerciseSplitStore';
	import CopyIcon from 'virtual:icons/carbon/copy';
	import PasteIcon from 'virtual:icons/carbon/paste';
	import CutIcon from 'virtual:icons/material-symbols/cut';

	let splitDays = $exerciseSplitStore.splitDays;
	let selectedDayIndex = splitDays.findIndex((splitDay) => splitDay !== null).toString();

	$: selectedSplitDay = splitDays[parseInt(selectedDayIndex)];
</script>

<H2>New exercise split</H2>
<H3>Exercises</H3>

<Tabs.Root bind:value={selectedDayIndex}>
	<Tabs.List class="w-full justify-start overflow-x-auto">
		{#each splitDays as splitDay, i}
			<Tabs.Trigger
				class="shrink-0 grow basis-20"
				value={i.toString()}
				disabled={splitDay === null}
			>
				{splitDay ? splitDay.name : 'Rest'}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#if selectedSplitDay}
		<div class="flex flex-col p-2">
			<div class="flex items-center gap-3">
				<div class="mr-auto flex flex-col">
					<span class="text-lg font-semibold">{selectedSplitDay.name}</span>
					<span class="font-sembold text-sm text-muted-foreground">
						Day {parseInt(selectedDayIndex) + 1}
					</span>
				</div>
				<Button size="icon" variant="outline" aria-label="copy exercises">
					<CopyIcon />
				</Button>
				<Button size="icon" variant="outline" aria-label="paste exercises">
					<PasteIcon />
				</Button>
				<Button size="icon" variant="outline" aria-label="cut exercises">
					<CutIcon />
				</Button>
			</div>
		</div>
	{/if}
</Tabs.Root>

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button variant="secondary">
		<a href="/exercise-splits/new/structure" class="w-full">Back</a>
	</Button>
	<Button>Next</Button>
</div>
