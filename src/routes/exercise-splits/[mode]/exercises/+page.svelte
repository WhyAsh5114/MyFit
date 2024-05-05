<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import CopyIcon from 'virtual:icons/lucide/copy';
	import PasteIcon from 'virtual:icons/lucide/clipboard-paste';
	import CutIcon from 'virtual:icons/lucide/scissors';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import SwapIcon from 'virtual:icons/ph/swap';
	import { exerciseSplitRunes } from '../exerciseSplitRunes.svelte';
	import ExerciseSplitDrawer from './ExerciseSplitDrawer.svelte';
	import ExerciseTemplateCard from '../../(components)/ExerciseTemplateCard.svelte';
</script>

<H3>Exercises</H3>
<Tabs.Root class="w-full" bind:value={exerciseSplitRunes.selectedSplitDayName}>
	<Tabs.List class="flex justify-start overflow-x-auto">
		{#each exerciseSplitRunes.splitExercises as _, idx}
			{@const { name, isRestDay } = exerciseSplitRunes.splitDays[idx]}
			<Tabs.Trigger value={name} disabled={isRestDay} class="px-4">
				{name !== '' ? name : 'Rest'}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each exerciseSplitRunes.splitExercises as _, idx}
		{@const splitDay = exerciseSplitRunes.splitDays[idx]}
		<Tabs.Content value={splitDay.name}>
			<div class="flex items-center gap-4">
				<div class="mr-auto flex flex-col">
					<span class="text-xl font-semibold">{splitDay.name}</span>
					<span class="font-medium text-muted-foreground">Day {idx + 1}</span>
				</div>
				<ExerciseSplitDrawer />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} size="icon" variant="outline"><MenuIcon /></Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item class="gap-2">
								<CutIcon /> Cut
							</DropdownMenu.Item>
							<DropdownMenu.Item class="gap-2">
								<CopyIcon /> Copy
							</DropdownMenu.Item>
							<DropdownMenu.Item class="gap-2">
								<PasteIcon /> Paste
							</DropdownMenu.Item>
							<DropdownMenu.Item class="gap-2">
								<SwapIcon /> Swap
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			{#each exerciseSplitRunes.splitExercises[exerciseSplitRunes.selectedSplitDayIndex] as exerciseTemplate, idx}
				<ExerciseTemplateCard {exerciseTemplate} {idx} dragDisabled />
			{/each}
		</Tabs.Content>
	{/each}
</Tabs.Root>
