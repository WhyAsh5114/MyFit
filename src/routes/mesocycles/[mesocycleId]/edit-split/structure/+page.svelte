<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import * as Table from '$lib/components/ui/table';
	import * as Popover from '$lib/components/ui/popover';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import AddIcon from 'virtual:icons/lucide/plus';
	import RemoveIcon from 'virtual:icons/lucide/minus';
	import WarningIcon from 'virtual:icons/lucide/triangle-alert';
	import { mesocycleExerciseSplitRunes } from '../mesocycleExerciseSplitRunes.svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';

	const difference = <T,>(setA: Set<T>, setB: Set<T>): Set<T> => {
		return new Set([...setA].filter((x) => !setB.has(x)));
	};

	let consistencyLossDays: string[] = $state([]);
	let dataLossDays: number[] = $state([]);
	let warningDialogOpen = $state(false);

	let showWarningIcon = $derived.by(() => {
		if (mesocycleExerciseSplitRunes.mesocycle === null) return false;
		const mesocycleSplitDayNames = new Set(
			mesocycleExerciseSplitRunes.mesocycle?.mesocycleExerciseSplitDays.map(
				(splitDay) => splitDay.name
			)
		);
		const currentSplitDayNames = new Set(
			mesocycleExerciseSplitRunes.splitDays.map((splitDay) => splitDay.name)
		);
		const inconsistentDays = difference(mesocycleSplitDayNames, currentSplitDayNames);
		consistencyLossDays = Array.from(inconsistentDays);
		return inconsistentDays.size > 0;
	});

	async function submitStructure(warningAcknowledged = false) {
		if (!mesocycleExerciseSplitRunes.validateSplitStructure()) {
			toast.error('Workout names should be unique', {
				description: 'For example: Push A, Push B'
			});
			return;
		}
		dataLossDays = mesocycleExerciseSplitRunes.getDataLossDays();
		if (!warningAcknowledged && dataLossDays.length > 0) {
			warningDialogOpen = true;
			return;
		}
		mesocycleExerciseSplitRunes.updateSplitExercisesStructure();
		warningDialogOpen = false;
		await goto('./exercises');
	}
</script>

<H3>Structure</H3>
<form
	class="contents"
	id="exercise-split-structure-form"
	onsubmit={(e) => {
		e.preventDefault();
		submitStructure();
	}}
>
	<span class="mb-1.5 text-sm font-medium">Exercise split structure</span>
	<Table.Root>
		<Table.Header class="border-t">
			<Table.Row>
				<Table.Head>
					<Popover.Root>
						<Popover.Trigger
							aria-label="mesocycle-exercise-split-edit-warning"
							class={cn({ 'text-background': !showWarningIcon })}
						>
							<WarningIcon class="h-4 w-4" />
						</Popover.Trigger>
						<Popover.Content class="w-60 text-sm" align="end">
							Unmatched day names: <span class="font-semibold">
								{consistencyLossDays.join(', ')}
							</span>
							<br />
							<p class="text-muted-foreground">
								Avoid unnecessarily changing split day names, as this can exclude workouts with
								unmatched split names from progression calculations and analytics.
							</p>
						</Popover.Content>
					</Popover.Root>
				</Table.Head>
				<Table.Head>Name</Table.Head>
				<Table.Head class="text-center">Rest</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each mesocycleExerciseSplitRunes.splitDays as splitDay, dayNumber}
				<Table.Row>
					<Table.Cell class="text-center">{dayNumber + 1}</Table.Cell>
					<Table.Cell>
						<Input
							id="exercise-split-day-{dayNumber + 1}-name"
							placeholder={splitDay.isRestDay ? 'Rest' : `Day ${dayNumber + 1}`}
							disabled={splitDay.isRestDay}
							required
							bind:value={splitDay.name}
						/>
					</Table.Cell>
					<Table.Cell class="p-0 text-center">
						<Checkbox
							checked={splitDay.isRestDay}
							onCheckedChange={(checked) => {
								if (checked === 'indeterminate') return;
								mesocycleExerciseSplitRunes.toggleSplitDay(dayNumber, checked);
							}}
						/>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</form>

<div class="mb-1 mt-auto grid grid-cols-2 gap-1 pt-1">
	<Button
		variant="secondary"
		class="gap-2"
		onclick={mesocycleExerciseSplitRunes.removeSplitDay}
		disabled={mesocycleExerciseSplitRunes.splitDays.length === 1}
	>
		<RemoveIcon /> Remove
	</Button>
	<Button variant="secondary" class="gap-2" onclick={mesocycleExerciseSplitRunes.addSplitDay}>
		<AddIcon /> Add
	</Button>
</div>
<Button type="submit" form="exercise-split-structure-form">Next</Button>

<ResponsiveDialog title="Warning" needTrigger={false} bind:open={warningDialogOpen}>
	<p>
		You'll lose exercise data from the following days:
		<span class="font-semibold text-yellow-500">
			{dataLossDays.map((day) => `Day ${day + 1}`).join(', ')}
		</span>. Continue?
	</p>
	<Button variant="destructive" onclick={() => submitStructure(true)}>Continue</Button>
</ResponsiveDialog>
