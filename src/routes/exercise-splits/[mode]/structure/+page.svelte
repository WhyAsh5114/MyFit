<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import AddIcon from 'virtual:icons/lucide/plus';
	import RemoveIcon from 'virtual:icons/lucide/minus';
	import { exerciseSplit } from '../exerciseSplitRunes.svelte';
	import { goto } from '$app/navigation';

	let dataLossDays: number[] = $state([]);
	let warningDialogOpen = $state(false);

	async function submitStructure(warningAcknowledged = false) {
		dataLossDays = exerciseSplit.getDataLossDays();
		if (!warningAcknowledged && dataLossDays.length > 0) {
			warningDialogOpen = true;
			return;
		}
		exerciseSplit.updateSplitExercisesStructure();
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
	<div class="mb-4 flex w-full flex-col gap-1.5">
		<Label for="exercise-split-name">Exercise split name</Label>
		<Input
			id="exercise-split-name"
			placeholder="Type here"
			required
			bind:value={exerciseSplit.splitName}
		/>
	</div>

	<span class="mb-1.5 text-sm font-medium">Exercise split structure</span>
	<Table.Root>
		<Table.Header class="border-t">
			<Table.Row>
				<Table.Head></Table.Head>
				<Table.Head>Name</Table.Head>
				<Table.Head class="text-center">Rest</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each exerciseSplit.splitDays as splitDay, dayNumber}
				<Table.Row>
					<Table.Cell>{dayNumber + 1}</Table.Cell>
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
								exerciseSplit.toggleSplitDay(dayNumber, checked);
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
		onclick={exerciseSplit.removeSplitDay}
		disabled={exerciseSplit.splitDays.length === 1}
	>
		<RemoveIcon /> Remove
	</Button>
	<Button variant="secondary" class="gap-2" onclick={exerciseSplit.addSplitDay}>
		<AddIcon /> Add
	</Button>
</div>
<Button type="submit" form="exercise-split-structure-form">Next</Button>

<ResponsiveDialog title="Warning" needTrigger={false} bind:open={warningDialogOpen}>
	<p>
		You'll lose exercise data from the following days:
		<span class="font-semibold text-yellow-500">{dataLossDays.join(', ')}</span>. Continue?
	</p>
	<Button class="destructive">Continue</Button>
</ResponsiveDialog>
