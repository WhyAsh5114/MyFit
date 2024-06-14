<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import Button from '$lib/components/ui/button/button.svelte';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { exerciseSplitRunes } from '../../exerciseSplitRunes.svelte';
	import type { Selected } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { open = $bindable(false) }: { open: boolean } = $props();
	let swapExercisesFrom: Selected<number> | undefined = $state();

	function swapExercises() {
		if (!swapExercisesFrom?.value) return;
		exerciseSplitRunes.swapExercises(swapExercisesFrom.value);
		swapExercisesFrom = undefined;
		open = false;
	}
</script>

<ResponsiveDialog title="Swap exercises" needTrigger={false} bind:open>
	<p>
		Swap <span class="font-semibold">
			{exerciseSplitRunes.splitDays[exerciseSplitRunes.selectedSplitDayIndex].name}
			<span class="text-muted-foreground">(Day {exerciseSplitRunes.selectedSplitDayIndex + 1})</span
			>
		</span> exercises with:
	</p>
	<form onsubmit={swapExercises} class="flex w-full gap-2">
		<Select.Root bind:selected={swapExercisesFrom} required>
			<Select.Trigger class="grow">
				<Select.Value placeholder="Select one" />
			</Select.Trigger>
			<Select.Content>
				{#each exerciseSplitRunes.splitDays as splitDay, idx}
					{@const isSelectedDay = idx === exerciseSplitRunes.selectedSplitDayIndex}
					{#if !splitDay.isRestDay}
						<Select.Item
							value={idx}
							disabled={isSelectedDay}
							class={cn({ 'text-primary': isSelectedDay })}
						>
							{splitDay.name} (Day {idx + 1})
						</Select.Item>
					{:else if splitDay}
						<Select.Item value={idx} disabled>Rest (Day {idx + 1})</Select.Item>
					{/if}
				{/each}
			</Select.Content>
		</Select.Root>
		<Button type="submit" class="shrink-0">Swap exercises</Button>
	</form>
</ResponsiveDialog>
